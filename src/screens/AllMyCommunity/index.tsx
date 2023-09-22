/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  LogBox,
  ScrollView,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import debounce from 'lodash.debounce';
import { styles } from './styles';
import { SvgXml } from 'react-native-svg';
import { circleCloseIcon, closeIcon, plusIcon, searchIcon } from '../../svg/svg-xml-list';
import { useNavigation } from '@react-navigation/native';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import type { ISearchItem } from '../../components/SearchItem';
import SearchItem from '../../components/SearchItem';

export default function AllMyCommunity() {
  LogBox.ignoreAllLogs(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType,] = useState('community');
  const [communities, setCommunities] =
    useState<Amity.LiveCollection<Amity.Community>>();
  const navigation = useNavigation<any>();
  const [searchList, setSearchList] = useState<ISearchItem[]>([]);
  const scrollViewRef = useRef(null);
  const {
    data: communitiesArr = [],
    onNextPage,
  } = communities ?? {};

  const goBack=()=>{
    navigation.goBack()
  }
  const onClickCreateCommunity = ()=>{
    navigation.navigate("CreateCommunity")
  }
  navigation.setOptions({
    // eslint-disable-next-line react/no-unstable-nested-components
    headerLeft:()=>(  <TouchableOpacity onPress={goBack} style={styles.btnWrap}>
      <SvgXml xml={closeIcon} width="15" height="15" />
    </TouchableOpacity>),
    headerRight: () => (
      <TouchableOpacity onPress={onClickCreateCommunity}>
        <SvgXml xml={plusIcon} width="25" height="25" />
      </TouchableOpacity>
    ),
    headerTitle: 'My Community',
  });

  const handleChange = (text: string) => {
    setSearchTerm(text);
  };
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    const isScrollEndReached =
      layoutMeasurement.height + contentOffset.y + 200 >= contentSize.height;

    if (isScrollEndReached) {
      onNextPage && onNextPage();
    }
  };
  useEffect(() => {
    searchCommunities(searchTerm);
  }, [searchTerm]);

  const searchCommunities = (text: string) => {
    const unsubscribe = CommunityRepository.getCommunities(
      { displayName: text, membership: 'member', limit: 20 },
      (data) => {
        setCommunities(data);
        if (data.data.length === 0) {
          setSearchList([]);
        }
      }
    );
    unsubscribe();
  };

  useEffect(() => {
    if (communitiesArr.length > 0 && searchType === 'community') {
      const searchItem: ISearchItem[] = communitiesArr.map((item) => {
        return {
          targetId: item?.communityId,
          targetType: searchType,
          displayName: item?.displayName,
          categoryIds: item?.categoryIds,
          avatarFileId: item?.avatarFileId ?? '',
        };
      });
      setSearchList(searchItem);
    }
  }, [communitiesArr]);


  const debouncedResults = useMemo(() => {
    return debounce(handleChange, 500);
  }, []);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });

  const clearButton = () => {
    setSearchTerm('');
  };

  const cancelSearch = () => {
    navigation.goBack();
  };

  return (
    <View>
      <View style={styles.headerWrap}>
        <View style={styles.inputWrap}>

          <SvgXml xml={searchIcon} width="20" height="20" />

          <TextInput
            style={styles.input}
            value={searchTerm}
            onChangeText={handleChange}
          />
          <TouchableOpacity onPress={clearButton}>
            <SvgXml xml={circleCloseIcon} width="20" height="20" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={cancelSearch}>
          <Text style={styles.cancelBtn}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={20}
        contentContainerStyle={styles.searchScrollList}>
        {searchList.map((item, index) => (
          <SearchItem key={index} target={item} />
        ))}
      </ScrollView>
    </View>
  );
}
