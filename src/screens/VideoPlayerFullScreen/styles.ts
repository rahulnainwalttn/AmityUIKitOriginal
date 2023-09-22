import { Dimensions, StyleSheet } from 'react-native';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: screenWidth,
    height: screenHeight,
  },
  videoLandscape: {
    width: screenHeight,
    height: screenWidth,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  controlButton: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  timeLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  slider: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  closeButton: {
    width: 30,
    height: 30,
    padding: 7,
    alignSelf: 'flex-end',
    margin: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 72,
  },
});

export default styles;
