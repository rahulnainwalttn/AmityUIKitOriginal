/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
// import { useTranslation } from 'react-i18next';

import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  type StyleProp,
  type  ImageStyle,
  Modal,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import styles from './styles';
import { SvgXml } from 'react-native-svg';
import {
  arrowXml,
  commentXml,
  likedXml,
  likeXml,
  personXml,
  playBtn,
  threeDots,
} from '../../../svg/svg-xml-list';

import type { UserInterface } from '../../../types/user.interface';
import {
  addPostReaction,
  getPostById,
  isReportTarget,
  removePostReaction,
  reportTargetById,
  unReportTargetById,
} from '../../../providers/Social/feed-sdk';
import { getCommunityById } from '../../../providers/Social/communities-sdk';
import ImageView from '../../../components/react-native-image-viewing/dist';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import useAuth from '../../../hooks/useAuth';

export interface IPost {
  postId: string;
  data: Record<string, any>;
  dataType: string | undefined;
  myReactions: string[];
  reactionCount: Record<string, number>;
  commentsCount: number;
  user: UserInterface | undefined;
  updatedAt: string | undefined;
  editedAt: string | undefined;
  createdAt: string;
  targetType: string;
  targetId: string;
  childrenPosts: string[];
}
export interface IPostList {
  onDelete?: (postId: string) => void;
  postDetail: IPost;
  initVideoPosts?: IVideoPost[];
  initImagePosts?: string[];
  initVideoPostsFullSize?: MediaUri[];
  initImagePostsFullSize?: MediaUri[];
}
export interface MediaUri {
  uri: string;
}
export interface IVideoPost {
  thumbnailFileId: string;
  videoFileId: {
    original: string;
  };
}
export default function PostList({
  postDetail,
  initVideoPostsFullSize = [],
  initImagePostsFullSize = [],
  onDelete,
}: IPostList) {
  const {
    postId,
    data,
    myReactions,
    reactionCount,
    commentsCount,
    createdAt,
    user,
    targetType,
    targetId,
    childrenPosts,
  } = postDetail ?? {};

  const { client } = useAuth();
  const [isLike, setIsLike] = useState<boolean>(false);
  const [likeReaction, setLikeReaction] = useState<number>(0);
  const [communityName, setCommunityName] = useState('');
  const [imagePosts, setImagePosts] = useState<string[]>([]);

  const [imagePostsFullSize, setImagePostsFullSize] = useState<MediaUri[]>([]);
  const [videoPostsFullSize, setVideoPostsFullSize] = useState<MediaUri[]>([]);
  const [videoPosts, setVideoPosts] = useState<IVideoPost[]>([]);
  const [visibleFullImage, setIsVisibleFullImage] = useState<boolean>(false);
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isReportByMe, setIsReportByMe] = useState<boolean>(false);

  const slideAnimation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const openModal = () => {
    setIsVisible(true);
  };

  const closeModal = () => {
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };

  const getPostInfo = useCallback(async () => {
    try {
      const response = await Promise.all(
        childrenPosts.map(async (id: string) => {
          const { data: post } = await getPostById(id);
          return { dataType: post.dataType, data: post.data };
        })
      );

      response.forEach((item) => {
        if (item.dataType === 'image') {
          setImagePosts((prev) => [
            ...prev,
            `https://api.amity.co/api/v3/files/${item?.data.fileId}/download?size=medium`,
          ]);
          setImagePostsFullSize((prev) => [
            ...prev,
            {
              uri: `https://api.amity.co/api/v3/files/${item?.data.fileId}/download?size=large`,
            },
          ]);
        } else if (item.dataType === 'video') {
          setVideoPosts((prev) => [...prev, item.data]);
          setVideoPostsFullSize((prev) => [
            ...prev,
            {
              uri: `https://api.amity.co/api/v3/files/${item?.data.thumbnailFileId}/download?size=large`,
            },
          ]);
        }
      });
    } catch (error) {
      console.log('error: ', error);
    }
  }, [childrenPosts]);

  const checkIsReport = async () => {
    const isReport = await isReportTarget('post', postId);
    if (isReport) {
      setIsReportByMe(true);
    }
  };
  useEffect(() => {
    if (initImagePostsFullSize) {
      setImagePostsFullSize(initImagePostsFullSize);
    } else if (initVideoPostsFullSize) {
      setVideoPostsFullSize(initVideoPostsFullSize);
    }
    checkIsReport();
    return () => {
      setImagePostsFullSize([]);
      setImagePosts([]);
    };
  }, []);
  useEffect(() => {
    if (myReactions.length > 0 && myReactions.includes('like')) {
      setIsLike(true);
    }
    if (reactionCount.like) {
      setLikeReaction(reactionCount.like);
    }
    if (targetType === 'community' && targetId) {
      getCommunityInfo(targetId);
    }
    if (
      childrenPosts.length > 0 &&
      (imagePosts.length === 0 || videoPosts.length === 0) &&
      (initImagePostsFullSize.length === 0 ||
        initVideoPostsFullSize.length === 0)
    ) {
      getPostInfo();
    }
  }, []);

  function renderLikeText(likeNumber: number | undefined): string {
    if (!likeNumber) {
      return '';
    } else if (likeNumber === 1) {
      return 'like';
    } else {
      return 'likes';
    }
  }
  function renderCommentText(commentNumber: number | undefined): string {
    if (commentNumber === 0) {
      return '';
    } else if (commentNumber === 1) {
      return 'comment';
    } else {
      return 'comments';
    }
  }

  function getTimeDifference(timestamp: string): string {
    // Convert the timestamp string to a Date object
    const timestampDate = Date.parse(timestamp);

    // Get the current date and time
    const currentDate = Date.now();

    // Calculate the difference in milliseconds
    const differenceMs = currentDate - timestampDate;

    const differenceYear = Math.floor(
      differenceMs / (1000 * 60 * 60 * 24 * 365)
    );
    const differenceDay = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
    const differenceHour = Math.floor(differenceMs / (1000 * 60 * 60));
    const differenceMinutes = Math.floor(differenceMs / (1000 * 60));
    const differenceSec = Math.floor(differenceMs / 1000);

    if (differenceSec < 60) {
      return 'Just now';
    } else if (differenceMinutes < 60) {
      return (
        differenceMinutes +
        ` ${differenceMinutes === 1 ? 'min ago' : 'mins ago'}`
      );
    } else if (differenceHour < 24) {
      return (
        differenceHour + ` ${differenceHour === 1 ? 'hour ago' : 'hours ago'}`
      );
    } else if (differenceDay < 365) {
      return (
        (differenceDay !== 1 ? differenceDay : '') +
        ` ${differenceDay === 1 ? 'Yesterday' : 'days ago'}`
      );
    } else {
      return (
        differenceYear + ` ${differenceYear === 1 ? 'year ago' : 'years ago'}`
      );
    }
  }
  async function addReactionToPost() {
    setIsLike((prev) => !prev);
    if (isLike && likeReaction) {
      setLikeReaction(likeReaction - 1);
      await removePostReaction(postId, 'like');
    } else {
      setLikeReaction(likeReaction + 1);
      await addPostReaction(postId, 'like');
    }
  }

  async function getCommunityInfo(id: string) {
    const { data: community } = await getCommunityById(id);
    setCommunityName(community.data.displayName);
  }

  function onClickImage(index: number): void {
    setIsVisibleFullImage(true);
    setImageIndex(index);
  }

  function renderMediaPost(): ReactNode {
    let imageStyle: StyleProp<ImageStyle> | StyleProp<ImageStyle>[] =
      styles.imageLargePost;
    let colStyle: StyleProp<ImageStyle> = styles.col2;

    const thumbnailFileIds: string[] =
      videoPosts.length > 0
        ? videoPosts.map((item) => {
            return `https://api.amity.co/api/v3/files/${item?.thumbnailFileId}/download?size=medium`;
          })
        : [];
    let mediaPosts: string[] = [];
    if (initImagePostsFullSize.length > 0) {
      mediaPosts = initImagePostsFullSize.map((item) => item.uri);
    } else if (initVideoPostsFullSize.length > 0) {
      mediaPosts = initVideoPostsFullSize.map((item) => item.uri);
    } else {
      mediaPosts = thumbnailFileIds.length > 0 ? thumbnailFileIds : imagePosts;
    }

    const imageElement: ReactElement[] = mediaPosts.map(
      (item: string, index: number) => {
        if (mediaPosts.length === 1) {
          imageStyle = styles.imageLargePost;
          colStyle = styles.col6;
        } else if (mediaPosts.length === 2) {
          colStyle = styles.col3;
          if (index === 0) {
            imageStyle = [styles.imageLargePost, styles.imageMarginRight];
          } else {
            imageStyle = [styles.imageLargePost, styles.imageMarginLeft];
          }
        } else if (mediaPosts.length === 3) {
          switch (index) {
            case 0:
              colStyle = styles.col6;
              imageStyle = [styles.imageMediumPost, styles.imageMarginBottom];
              break;
            case 1:
              colStyle = styles.col3;
              imageStyle = [
                styles.imageMediumPost,
                styles.imageMarginTop,
                styles.imageMarginRight,
              ];
              break;
            case 2:
              colStyle = styles.col3;
              imageStyle = [
                styles.imageMediumPost,
                styles.imageMarginTop,
                styles.imageMarginLeft,
              ];
              break;

            default:
              break;
          }
        } else {
          switch (index) {
            case 0:
              colStyle = styles.col6;
              imageStyle = [
                styles.imageMediumLargePost,
                styles.imageMarginBottom,
              ];
              break;
            case 1:
              colStyle = styles.col2;
              imageStyle = [
                styles.imageSmallPost,
                styles.imageMarginTop,
                styles.imageMarginRight,
              ];
              break;
            case 2:
              colStyle = styles.col2;
              imageStyle = [
                styles.imageSmallPost,
                styles.imageMarginTop,
                styles.imageMarginLeft,
                styles.imageMarginRight,
              ];
              break;
            case 3:
              colStyle = styles.col2;
              imageStyle = [
                styles.imageSmallPost,
                styles.imageMarginTop,
                styles.imageMarginLeft,
              ];
              break;
            default:
              break;
          }
        }

        return (
          <View style={colStyle}>
            <TouchableWithoutFeedback onPress={() => onClickImage(index)}>
              <View>
                {(videoPosts.length > 0 || initVideoPostsFullSize.length > 0) &&
                  renderPlayButton()}
                <Image
                  style={imageStyle}
                  source={{
                    uri: item,
                  }}
                />
                {index === 3 && imagePosts.length > 4 && (
                  <View style={styles.overlay}>
                    <Text style={styles.overlayText}>{`+ ${
                      imagePosts.length - 3
                    }`}</Text>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        );
      }
    );

    if (imageElement.length < 3) {
      return (
        <View style={styles.imagesWrap}>
          <View style={styles.row}>{imageElement}</View>
        </View>
      );
    } else if (imageElement.length === 3) {
      return (
        <View style={[styles.imagesWrap]}>
          <View style={styles.row}>{imageElement.slice(0, 1)}</View>
          <View style={styles.row}>{imageElement.slice(1, 3)}</View>
        </View>
      );
    } else {
      return (
        <View style={styles.imagesWrap}>
          <View style={styles.row}>{imageElement.slice(0, 1)}</View>
          <View style={styles.row}>{imageElement.slice(1, 4)}</View>
        </View>
      );
    }
  }

  function renderPlayButton() {
    return (
      <View style={styles.playButton}>
        <SvgXml xml={playBtn} width="50" height="50" />
      </View>
    );
  }
  function onClickComment() {
    navigation.navigate('PostDetail', {
      postDetail: postDetail,
      init: videoPosts,
      initVideoPostsFullSize: videoPostsFullSize,
      initImagePostsFullSize: imagePostsFullSize,
      imagePosts: imagePosts,
    });
  }
  const handleDisplayNamePress = () => {
    if (user?.userId) {
      navigation.navigate('UserProfile', {
        userId: user.userId,
      });
    }
  };
  const handleCommunityNamePress = () => {
    if (targetType === 'community' && targetId) {
      navigation.navigate('CommunityHome', {
        communityId: targetId,
        communityName: communityName,
      });
    }
  };
  const deletePostObject = () => {
    Alert.alert(
      'Delete this post',
      `This post will be permanently deleted. You'll no longer see and find this post`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete && onDelete(postId),
        },
      ]
    );
    setIsVisible(false);
  };
  const reportPostObject = async () => {
    if (isReportByMe) {
      const unReportPost = await unReportTargetById('post', postId);
      if (unReportPost) {
        Alert.alert('Undo Report sent', '', []);
      }
      setIsVisible(false);
      setIsReportByMe(false);
    } else {
      const reportPost = await reportTargetById('post', postId);
      if (reportPost) {
        Alert.alert('Report sent', '', []);
      }
      setIsVisible(false);
      setIsReportByMe(true);
    }
  };
  const modalStyle = {
    transform: [
      {
        translateY: slideAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [600, 0], // Adjust this value to control the sliding distance
        }),
      },
    ],
  };
  return (
    <View key={postId} style={styles.postWrap}>
      <View style={styles.headerSection}>
        <View style={styles.user}>
          {user?.avatarFileId ? (
            <Image
              style={styles.avatar}
              source={{
                uri: `https://api.amity.co/api/v3/files/${user?.avatarFileId}/download`,
              }}
            />
          ) : (
            <View style={styles.avatar}>
              <SvgXml xml={personXml} width="20" height="16" />
            </View>
          )}

          <View>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={handleDisplayNamePress}>
                <Text style={styles.headerText}>{user?.displayName}</Text>
              </TouchableOpacity>

              {communityName && (
                <>
                  <SvgXml
                    style={styles.arrow}
                    xml={arrowXml}
                    width="8"
                    height="8"
                  />

                  <TouchableOpacity onPress={handleCommunityNamePress}>
                    <Text style={styles.headerText}>{communityName}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <Text style={styles.headerTextTime}>
              {getTimeDifference(createdAt)}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={openModal} style={styles.threeDots}>
          <SvgXml xml={threeDots} width="20" height="16" />
        </TouchableOpacity>
      </View>
      <View>
        <View style={styles.bodySection}>
          {data.text && <Text style={styles.bodyText}>{data.text}</Text>}

          {childrenPosts.length > 0 && (
            <View style={styles.mediaWrap}>{renderMediaPost()}</View>
          )}
        </View>

        {likeReaction === 0 && commentsCount === 0 ? (
          ''
        ) : (
          <TouchableWithoutFeedback onPress={() => onClickComment()}>
            <View style={styles.countSection}>
              {likeReaction ? (
                <Text style={styles.likeCountText}>
                  {likeReaction} {renderLikeText(likeReaction)}
                </Text>
              ) : (
                <Text />
              )}
              {commentsCount > 0 && (
                <Text style={styles.commentCountText}>
                  {commentsCount > 0 && commentsCount}{' '}
                  {renderCommentText(commentsCount)}
                </Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        )}

        <View style={styles.actionSection}>
          <TouchableOpacity
            onPress={() => addReactionToPost()}
            style={styles.likeBtn}
          >
            {isLike ? (
              <SvgXml xml={likedXml} width="20" height="16" />
            ) : (
              <SvgXml xml={likeXml} width="20" height="16" />
            )}

            <Text style={isLike ? styles.likedText : styles.btnText}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onClickComment()}
            style={styles.commentBtn}
          >
            <SvgXml xml={commentXml} width="20" height="16" />
            <Text style={styles.btnText}>Comment</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ImageView
        images={
          imagePostsFullSize.length > 0
            ? imagePostsFullSize
            : videoPostsFullSize
        }
        imageIndex={imageIndex}
        visible={visibleFullImage}
        onRequestClose={() => setIsVisibleFullImage(false)}
        isVideoButton={videoPosts.length > 0 ? true : false}
        videoPosts={videoPosts}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        onRequestClose={closeModal}
      >
        <Pressable onPress={closeModal} style={styles.modalContainer}>
          <Animated.View style={[styles.modalContent, modalStyle]}>
            {user?.userId === (client as Amity.Client).userId ? (
              <TouchableOpacity
                onPress={deletePostObject}
                style={styles.modalRow}
              >
                <Text style={styles.deleteText}> Delete Post</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={reportPostObject}
                style={styles.modalRow}
              >
                <Text style={styles.deleteText}>
                  {isReportByMe ? 'Undo Report' : 'Report'}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}
