import React, { useCallback, useEffect, useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import * as Progress from 'react-native-progress';
import { SvgXml } from 'react-native-svg';
import {
  deleteAmityFile,
  uploadImageFile,
} from '../../providers/file-provider';
import { closeIcon } from '../../svg/svg-xml-list';
import { createStyles } from './styles';

interface OverlayImageProps {
  source: string;
  onClose?: (originalPath: string) => void;
  onLoadFinish?: (
    fileId: string,
    fileUrl: string,
    fileName: string,
    index: number,
    originalPath: string
  ) => void;
  index?: number;
  isUploaded: boolean;
  fileId?: string;
}
const LoadingImage = ({
  source,
  onClose,
  index,
  onLoadFinish,
  isUploaded = false,
  fileId = '',
}: OverlayImageProps) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isProcess, setIsProcess] = useState<boolean>(false);
  const styles = createStyles();

  const handleLoadEnd = () => {
    setLoading(false);
  };
  useEffect(() => {
    if (progress === 100) {
      setIsProcess(true);
    }
  }, [progress]);

  const uploadFileToAmity = useCallback(async () => {
    const file: Amity.File<any>[] = await uploadImageFile(
      source,
      (percent: number) => {
        setProgress(percent);
      }
    );
    if (file) {
      setIsProcess(false);
      handleLoadEnd();
      onLoadFinish &&
        onLoadFinish(
          file[0]?.fileId as string,
          (file[0]?.fileUrl + '?size=medium') as string,
          file[0]?.attributes.name as string,
          index as number,
          source
        );
    }
  }, [index, onLoadFinish, source]);

  const handleDelete = async () => {
    if (fileId) {
      onClose && onClose(source);
      await deleteAmityFile(fileId);
    }
  };
  useEffect(() => {
    if (isUploaded) {
      setLoading(false);
    } else {
      uploadFileToAmity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUploaded, source]);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: source }}
        style={[
          styles.image,
          loading ? styles.loadingImage : styles.loadedImage,
        ]}
      />
      {loading && (
        <View style={styles.overlay}>
          {isProcess ? (
            <Progress.CircleSnail size={60} borderColor="transparent" />
          ) : (
            <Progress.Circle
              progress={progress / 100}
              size={60}
              borderColor="transparent"
              unfilledColor="#ffffff"
            />
          )}
        </View>
      )}
      {!loading && (
        <TouchableOpacity style={styles.closeButton} onPress={handleDelete}>
          <SvgXml xml={closeIcon} width="12" height="12" />
        </TouchableOpacity>
      )}
    </View>
  );
};
export default LoadingImage;
