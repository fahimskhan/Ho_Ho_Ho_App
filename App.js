import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ListView,
  Alert,
  Button,
  AsyncStorage,
} from 'react-native';

import {
  StackNavigator,
} from 'react-navigation';

import {
  Location,
  Permissions,
  MapView,
} from 'expo';

let user;

//Screens
// class HomeScreen extends React.Component {
//   static navigationOptions = {
//     title: 'Home'
//   };
//
//   register() {
//     this.props.navigation.navigate('Register');
//   }
//
//   login() {
//     this.props.navigation.navigate('Login');
//   }
//
//   render() {
//     return (<View style={styles.container}>
//       <Text style={styles.textBig}>Login to HoHoHo!</Text>
//       <TouchableOpacity onPress={() => {
//           this.login()
//         }} style={[styles.button, styles.buttonBlue]}>
//         <Text style={styles.buttonLabel}>Tap to Login</Text>
//       </TouchableOpacity>
//       <TouchableOpacity style={[styles.button, styles.buttonGreen]} onPress={() => {
//           this.register()
//         }}>
//         <Text style={styles.buttonLabel}>Tap to Register</Text>
//       </TouchableOpacity>
//     </View>)
//   }
// }

class RegisterScreen extends React.Component {
  static navigationOptions = {
    title: 'Register'
  };

  constructor() {
    super();
    this.state = {
      username: null,
      password: null,
      message: null
    }
  }

  register() {
    let status;
    fetch('https://hohoho-backend.herokuapp.com/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username: this.state.username, password: this.state.password})
    }).then((response) => {
      status = response.status;
      return response.json()
    }).then((responseJson) => {
      //console.log(responseJson, status)
      if (responseJson.success) {
        this.props.navigation.goBack();
      } else {
        this.setState({message: '***username not available, try a different one***'})
      }
    }).catch((error) => {
      console.log(error);
    })
  }

  render() {
    return (<View style={styles.container}>
      {/* <Text style={styles.textBig}>Register</Text> */}
      <Text style={{
          textAlign: 'center',
          color: 'red'
        }}>{this.state.message}</Text>
      <TextInput style={styles.inputField} placeholder="Enter your username" onChangeText={(text) => this.setState({username: text})}/>
      <TextInput style={styles.inputField} placeholder="Choose a password" secureTextEntry={true} onChangeText={(password) => this.setState({password: password})}/>
      <TouchableOpacity style={[styles.button, styles.buttonGreen]} onPress={() => {
          this.register()
        }}>
        <Text style={styles.buttonLabel}>Register</Text>
      </TouchableOpacity>
    </View>)
  }
}

class LoginScreen extends React.Component {
  static navigationOptions = {
    title: 'Login'
  };

  constructor() {
    super();
    this.state = {
      username: null,
      password: null,
      message: null
    }
  };

  componentDidMount() {
    AsyncStorage.getItem('user')
    .then((result) => {
      const parsedResult = JSON.parse(result);
      const username = parsedResult.username;
      const password = parsedResult.password;
      if (username && password) {
        this.login(username, password);
        // this.props.navigation.navigate('Users');
      }
    })
  }

  login(username, password) {
    let status;
    fetch('https://hohoho-backend.herokuapp.com/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username: username, password: password})
    }).then((response) => {
      status = response.status;
      return response.json()
    }).then((responseJson) => {
      //console.log(responseJson, status)
      if (responseJson.success) {
        user = username;
        AsyncStorage.setItem('user', JSON.stringify({
          username: username,
          password: password,
        }));
        this.props.navigation.navigate('Users');
      } else {
        if (status === 401) {
          this.setState({message: '***invalid username and/or password***'})
        } else {
          this.setState({message: '***invalid input***'})

        }
      }
    }).catch((error) => {
      console.log(error);
    })
  }

  render() {
    return (<View style={styles.container}>
      <Text style={styles.textBig}>Login to HoHoHo!</Text>
      <Text style={{
          textAlign: 'center',
          color: 'red'
        }}>{this.state.message}</Text>
      <TextInput style={styles.inputField} placeholder="Enter your username" onChangeText={(text) => this.setState({username: text})}/>
      <TextInput style={styles.inputField} placeholder="Choose a password" secureTextEntry={true} onChangeText={(password) => this.setState({password: password})}/>
      <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={() => {
          this.login(this.state.username, this.state.password)
        }}>
        <Text style={styles.buttonLabel}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.buttonGreen]} onPress={() => {
          this.props.navigation.navigate('Register')
        }}>
        <Text style={styles.buttonLabel}>Don't have an acount? Register!</Text>
      </TouchableOpacity>
    </View>)
  }
}

class UsersScreen extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: 'Users',
    headerRight: <Button title='Messages>' onPress={() => {navigation.state.params.onRightPress()}}/>,
    headerLeft: <Button title='<Logout' onPress={() => {navigation.state.params.onLeftPress()}}/>,
  });

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    this.state = {
      dataSource: ds.cloneWithRows([])
    };
    fetch('https://hohoho-backend.herokuapp.com/login/suceess')
    .then((response) => {
      if (response.status === 401) {
        Alert.alert('401', 'You are not logged in', [{text: 'Dismiss'}])
        this.props.navigation.navigate('Login');
      } else {
        fetch('https://hohoho-backend.herokuapp.com/users')
        .then((resp) => resp.json())
        .then((json) => {
          if (json.success) {
            this.setState({
              dataSource: ds.cloneWithRows(json.users),
            })
          } else {
            Alert.alert('Oops', 'Unable to load users.', [{text: 'Dismiss'}])
          }
        }).catch((err) => {
          console.log(err);
        })}
    }).catch((error) => {
      console.log(error);
    })
    this.messages = this.messages.bind(this);
    this.logout = this.logout.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({
      onRightPress: this.messages,
      onLeftPress: this.logout,
    })
  }

  touchUser(user) {
    fetch('https://hohoho-backend.herokuapp.com/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({to: user._id})
    })
    .then((response) => {
      if (response.status === 401) {
        Alert.alert('401', 'You are not logged in!', [{text: 'Dismiss'}]);
        this.props.navigation.navigate('Login');
      } else if (response.json === 400) {
        Alert.alert('400', 'Database error, sorry for the inconvenience.', [{text: 'Dismiss'}]);
      } else {
        return response.json()
      }
    })
    .then((json) => {
      if(json.success) {
        Alert.alert('Success', 'Your Ho Ho Ho to ' + user.username + ' has been sent!', [{text: 'Dismiss'}]);
      } else {
        Alert.alert('Oops', 'Your Ho Ho Ho to ' + user.username + ' could not be sent!', [{text: 'Dismiss'}])
      }
    })
    .catch((error) => {
      console.log(error);
    })
  }

  longTouchUser(user, location) {
    fetch('https://hohoho-backend.herokuapp.com/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: user._id,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords. longitude,
        },
      })
    })
    .then((response) => {
      if (response.status === 401) {
        Alert.alert('401', 'You are not logged in!', [{text: 'Dismiss'}]);
        this.props.navigation.navigate('Login');
      } else if (response.json === 400) {
        Alert.alert('400', 'Database error, sorry for the inconvenience.', [{text: 'Dismiss'}]);
      } else {
        return response.json()
      }
    })
    .then((json) => {
      if(json.success) {
        Alert.alert('Success', 'Your Ho Ho Ho and location has been sent to ' + user.username + '!', [{text: 'Dismiss'}]);
      } else {
        Alert.alert('Oops', 'Your Ho Ho Ho and location to could not be sent to ' + user.username + '!', [{text: 'Dismiss'}])
      }
    })
    .catch((error) => {
      console.log(error);
    })
  }

  sendLocation = async(user) => { //zzzz no idea what this async is doing here!!
    let {status} = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Unable to get permission to access location.', [{text: 'Dismiss'}])
    } else {
      let location = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
      //console.log(location);
      this.longTouchUser(user, location);
    }
  }

  messages() {
    this.props.navigation.navigate('Messages');
  }

  logout() {
    AsyncStorage.setItem('user', JSON.stringify({
      username: null,
      password: null,
    }))
    this.props.navigation.goBack();
  }

  render() {
    return (<View style={styles.container}>
      <ListView style={{width: '100%'}} enableEmptySections dataSource={this.state.dataSource} renderRow={(rowData) =>
        <View style={{alignItems: 'center'}}>
          <TouchableOpacity onPress={() => this.touchUser(rowData)} onLongPress={() => this.sendLocation(rowData)} delayLongPress={3000}>
            <Text key={rowData._id} style={styles.users}>{rowData.username}</Text>
          </TouchableOpacity>
        </View>}/>
    </View>)
  }
}

class MessagesScreen extends React.Component{
  static navigationOptions={
    title: 'Messages'
  }

  constructor(props){
    super(props);
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    this.state={
      dataSource: ds.cloneWithRows([])
    };
    fetch('https://hohoho-backend.herokuapp.com/login/suceess')
    .then((response) => {
      if (response.status === 401) {
        Alert.alert('401', 'You are not logged in', [{text: 'Dismiss'}])
        this.props.navigation.navigate('Login');
      } else {
        fetch('https://hohoho-backend.herokuapp.com/messages')
        .then((resp) => {
          //console.log(resp);
          return resp.json();
        })
        .then((json) => {
          if (json.success) {
            //console.log(json)
            this.setState({
              dataSource: ds.cloneWithRows(json.messages),
            })
          } else {
            Alert.alert('Oops', 'Unable to load messages.', [{text: 'Dismiss'}])
          }
        }).catch((err) => {
          console.log(err);
        })}
    }).catch((error) => {
      console.log(error);
    })
  }

  render() {
    return (
      <View style={{display:'flex', flex:1, backgroundColor:'#F5FCFF'}}>
        <ListView enableEmptySections style={{display:'flex', width: '100%'}} dataSource={this.state.dataSource} renderRow={(rowData) => {
          return user === rowData.from.username
          ? (rowData.location && rowData.location.longitude)
          ? <View style={{display:'flex', alignItems:'flex-end'}}>
              <View style={styles.outgoingMessages}>
                <Text style={{color:'white', fontSize:16, marginRight:5}}>You sent Ho Ho Ho to {rowData.to.username}!</Text>
              </View>
              <View style={{alignItems: 'flex-start'}}>
                <MapView style = {{
                  height: 100,
                  width: 250,
                  marginRight: 5,
                  borderRadius: 5,
                }}
                region = {{
                  latitude: rowData.location.latitude,
                  longitude: rowData.location.longitude,
                  latitudeDelta: 0.009,
                  longitudeDelta: 0.003,
                }}
              ><MapView.Marker
                coordinate={{
                    latitude: rowData.location.latitude,
                    longitude: rowData.location.longitude
                  }}
                  title={"Location"}
              />
              </MapView>
              </View>
              <View style={{alignItems:'flex-end'}}>
                <Text style={{color:'grey', fontSize:10, marginRight:5}}>{new Date(rowData.timestamp).toLocaleString()}</Text>
              </View>
            </View>
          : <View style={{display:'flex', alignItems:'flex-end'}}>
              <View style={styles.outgoingMessages}>
                <Text style={{color:'white', fontSize:16, marginRight:5}}>You sent Ho Ho Ho to {rowData.to.username}!</Text>
              </View>
              <View style={{alignItems:'flex-end'}}>
                <Text style={{color:'grey', fontSize:10, marginRight:5}}>{new Date(rowData.timestamp).toLocaleString()}</Text>
              </View>
            </View>
            : (rowData.location && rowData.location.longitude)
            ? <View style={{display:'flex', alignItems:'flex-start'}}>
              <View style={styles.incomingMessages}>
                <Text style={{color:'white', fontSize:16, marginLeft:5}}>{rowData.from.username} sent Ho Ho Ho to you!</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <MapView style = {{
                  height: 100,
                  width: 250,
                  marginLeft: 5,
                  borderRadius: 5,
                }}
                region = {{
                  latitude: rowData.location.latitude,
                  longitude: rowData.location.longitude,
                  latitudeDelta: 0.009,
                  longitudeDelta: 0.003,
                }}
              ><MapView.Marker
                coordinate={{
                    latitude: rowData.location.latitude,
                    longitude: rowData.location.longitude
                  }}
                  title={"Location"}
              />
              </MapView>
              </View>
              <View>
                <Text style={{color:'grey', fontSize:10, marginLeft:5}}>{new Date(rowData.timestamp).toLocaleString()}</Text>
              </View>
            </View>
            : <View style={{display:'flex', alignItems:'flex-start'}}>
              <View style={styles.incomingMessages}>
                <Text style={{color:'white', fontSize:16, marginLeft:5}}>{rowData.from.username} sent Ho Ho Ho to you!</Text>
              </View>
              <View>
                <Text style={{color:'grey', fontSize:10, marginLeft:5}}>{new Date(rowData.timestamp).toLocaleString()}</Text>
              </View>
            </View>
          }
        }/>
      </View>
    )
  }
}

//Navigator
export default StackNavigator({
  // Home: {
  //   screen: HomeScreen
  // },
  Register: {
    screen: RegisterScreen
  },
  Login: {
    screen: LoginScreen
  },
  Users: {
    screen: UsersScreen
  },
  Messages: {
    screen: MessagesScreen
  },
}, {initialRouteName: 'Login'});

//Styles
const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  containerFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5
  },
  textBig: {
    fontSize: 36,
    textAlign: 'center',
    margin: 10
  },
  button: {
    alignSelf: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 5
  },
  buttonRed: {
    backgroundColor: '#FF585B'
  },
  buttonBlue: {
    backgroundColor: '#0074D9'
  },
  buttonGreen: {
    backgroundColor: '#2ECC40'
  },
  buttonLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white'
  },
  inputField: {
    alignSelf: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 5,
    backgroundColor: '#D3D3D3'
  },
  users: {
    //alignSelf: 'stretch',
    textAlign: 'center',
    width: 200,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: '#B0E0E6',
    //borderRadius: 5,
  },
  outgoingMessages: {
    alignItems: 'flex-end',
    width: 250,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 5,
    backgroundColor: '#2ECC40',
  },
  incomingMessages: {
    alignItems: 'flex-start',
    width: 250,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 5,
    backgroundColor: '#FF585B',
  },
});
