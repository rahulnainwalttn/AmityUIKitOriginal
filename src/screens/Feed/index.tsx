import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

// import { useTranslation } from 'react-i18next';

import { FlatList, View } from 'react-native';
import useAuth from '../../hooks/useAuth';
import PostList, { type IPost } from '../../components/Social/PostList';
import styles from './styles';
import { getAmityUser } from '../../providers/user-provider';
import type { UserInterface } from '../../types/user.interface';
import { PostRepository } from '@amityco/ts-sdk-react-native';
import type { FeedRefType } from '../CommunityHome';
import { deletePostById } from '../../providers/Social/feed-sdk';

interface IFeed {
  targetId: string;
  targetType: string;
}
function Feed({ targetId, targetType }: IFeed, ref: React.Ref<FeedRefType>) {
  const { client } = useAuth();
  const [postData, setPostData] =
    useState<Amity.LiveCollection<Amity.Post<any>>>();
  const [postList, setPostList] = useState<IPost[]>([]);
  const { data: posts, onNextPage, hasNextPage } = postData ?? {};
  const flatListRef = useRef(null);

  async function getFeed(): Promise<void> {
    const unsubscribe = PostRepository.getPosts(
      { targetId, targetType, sortBy: 'lastCreated' },
      (data) => {
        setPostData(data);
      }
    );
    unsubscribe();
  }
  const handleLoadMore = () => {
    if (hasNextPage) {
      onNextPage && onNextPage();
    }
  };
  useEffect(() => {
    return () => {
      setPostData(undefined);
      setPostList([]);
    };
  }, []);
  useEffect(() => {
    getFeed();
  }, [client]);

  const getPostList = useCallback(async () => {
    if (posts && posts.length > 0) {
      const formattedPostList = await Promise.all(
        posts.map(async (item: Amity.Post<any>) => {
          const { userObject } = await getAmityUser(item.postedUserId);
          let formattedUserObject: UserInterface;

          formattedUserObject = {
            userId: userObject.data.userId,
            displayName: userObject.data.displayName,
            avatarFileId: userObject.data.avatarFileId,
          };

          return {
            postId: item.postId,
            data: item.data as Record<string, any>,
            dataType: item.dataType,
            myReactions: item.myReactions as string[],
            reactionCount: item.reactions as Record<string, number>,
            commentsCount: item.commentsCount,
            user: formattedUserObject as UserInterface,
            editedAt: item.editedAt,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            targetType: item.targetType,
            targetId: item.targetId,
            childrenPosts: item.children,
          };
        })
      );
      setPostList([...formattedPostList]);
    }
  }, [posts]);
  useEffect(() => {
    if (posts) {
      getPostList();
    }
  }, [posts]);

  useImperativeHandle(ref, () => ({
    handleLoadMore,
  }));

  const onDeletePost = async (postId: string) => {
    const isDeleted = await deletePostById(postId);
    if (isDeleted) {
      const prevPostList: IPost[] = [...postList];
      const updatedPostList: IPost[] = prevPostList.filter(
        (item) => item.postId !== postId
      );
      setPostList(updatedPostList);
    }
  };
  return (
    <View style={styles.feedWrap}>
      <FlatList
        data={postList}
        renderItem={({ item }) => (
          <PostList onDelete={onDeletePost} postDetail={item} />
        )}
        keyExtractor={(item) => item.postId.toString()}
        onEndReachedThreshold={0.8}
        // onEndReached={handleLoadMore}
        ref={flatListRef}
        scrollEnabled={false}
      />
    </View>
  );
}
export default forwardRef(Feed);
