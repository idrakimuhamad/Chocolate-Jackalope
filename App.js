import React, { Component } from 'react';
import Expo, { AppLoading } from 'expo';
import {
  Platform,
  ActivityIndicator,
  StatusBar,
  View,
  Text,
  StyleSheet,
  ListView,
  ScrollView,
  Image,
  TouchableHighlight,
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import getList from './api/getList';

const window = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};

export default class App extends Component {

  // the app default state
  // redux wasn't implemented due to the time constraint
  state = {
    appIsReady: false,
    pageNumber: 1,
    pageSize: 10,
    dataSource: new ListView.DataSource({
      rowHasChanged: this._rowHasChanged.bind(this)
    }),
    lists: [],
    modalVisible: false,
    loadMore: false,
    endOfList: false
  };

  componentWillMount() {
    // load the initial list
    this._getList(true);
  }

  // the function that call the api to load the list by its pagination
  _getList(initialAppLoad = false) {
    const { pageSize, pageNumber, lists } = this.state;
    getList({ size: pageSize, page: pageNumber })
    .then((response) => {

      // if no error
      if (!response.Errors.length) {

        // if the result array actually contained something,
        // we merge it with existing list and create the data source with it
        if (response.Result.length) {
          const tempList = [ ...lists, ...response.Result];
          const dataSource = this.state.dataSource.cloneWithRows(tempList);
          const stateObj = {
            dataSource,
            pageNumber: pageNumber + 1,
            lists: tempList,
            loadMore: false
          };

          if (initialAppLoad) stateObj.appIsReady = true;

          this.setState(stateObj);

          console.log('getting list done');
        } else {
          console.log('Reached end of the list');
          this.setState({
            endOfList: true
          });
        }
      } else {
        console.error('Error in retrieving the list', response.Errors[0]);
      }
    });
  }

  _loadMore = async () => {
    // fetch more data when reaching the end of the list
    const { endOfList } = this.state;

    console.log('trigger load more');

    this.setState({ loadMore: true });

    if (!endOfList) this._getList();
  }

  _rowHasChanged(r1, r2) {
    return r1.AlbumName !== r2.AlbumName;
  }

  _renderRow = (item) => {
    return (
      <TouchableHighlight
        onPress={() => {
          this._renderImageGallery(item.Images)
        }}>
        <View>
          <View
            style={styles.column}>
            <Image
              style={styles.instaphoto}
              source={{uri: item.AlbumCover}}
              resizeMode="cover"
            />
            <Text
              style={styles.albumName}>
              {item.AlbumName}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  _renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    return (
      <View
        key={`${sectionID}-${rowID}`}
        style={{
          height: adjacentRowHighlighted ? 4 : 1,
          backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#CCCCCC',
        }}
      />
    );
  }

  _renderImageGallery(images) {
    this._setModalState(true);

    this.setState({
      currentImageGallery: images
    });
  }

  _renderImageInGallery(image) {
    return (
      <Image
        key={image.ContentURL}
        source={{ uri: image.ContentURL }}
        style={styles.imageGallery}
        resizeMode="cover" />
    );
  }

  _setModalState(visible) {
    this.setState({ modalVisible: visible });
  }

  render() {
    const {
      appIsReady,
      lists,
      currentImageGallery,
      loadMore,
      endOfList,
      modalVisible
    } = this.state;

    if (appIsReady) {
      return (
        <View
          style={styles.container}>
          <ListView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            onEndReached={this._loadMore}
            onEndReachedThreshold={30}
            dataSource={this.state.dataSource}
            renderRow={this._renderRow}
            // renderSeparator={this._renderSeparator}
          />
          {loadMore ?
            <View
              style={styles.loadingIndicator}>
              <View>
                {endOfList ?
                  <Text style={styles.loadingIndicatorText}>You have reached the end of the list</Text>
                  :
                  <View style={styles.loadingIndicatorContainer}>
                    <ActivityIndicator
                      animating={loadMore}
                      style={styles.centering}
                      size="small"
                    />
                    <Text
                      style={styles.loadingIndicatorText}>Loading...</Text>
                    </View>
                }
              </View>
            </View>
            : null}
          <Modal
            animationType={"slide"}
            transparent={false}
            visible={modalVisible}
            >
           <View style={styles.imageGalleryContainer}>
            <View>
              <ScrollView
                contentContainerStyle={styles.imageGalleryVerticalContainer}
                pagingEnabled
                directionalLockEnabled
                horizontal
                >
                {currentImageGallery && currentImageGallery.map((image) => this._renderImageInGallery(image))}
              </ScrollView>
            </View>
            <TouchableHighlight
              style={styles.closeModal}
              onPress={() => {
                this._setModalState(!modalVisible)
              }}
              activeOpacity={0.5}
              underlayColor="transparent"
              >
              <Ionicons name="ios-close" size={42} color="rgba(255,255,255, .75)" />
            </TouchableHighlight>
           </View>
          </Modal>
        </View>
      )
    } else {
      return (
        <AppLoading />
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: (Platform.OS === 'ios') ? 20 : 0,
  },
  column: {
    flexDirection: 'column',
    // justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFF',
  },
  instaphoto: {
    width: window.width,
    height: window.width,
  },
  albumName: {
    paddingTop: 20,
    paddingBottom: 20
  },
  imageGalleryContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0, .88)'
  },
  imageGalleryVerticalContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: window.height
  },
  imageGallery: {
    width: window.width,
    height: window.height
  },
  closeModal: {
    position: 'absolute',
    top: 20,
    right: 10,
    backgroundColor: 'rgba(0,0,0, .5)',
    paddingLeft: 15,
    paddingRight: 15
  },
  loadingIndicator: {
    position: 'absolute',
    bottom: 0,
    padding: 20,
    flex: 1,
    backgroundColor: 'rgba(255,255,255, 0.77)',
    width: window.width
  },
  loadingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingIndicatorText: {
    textAlign: 'center'
  },
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    height: 40
  },
});
