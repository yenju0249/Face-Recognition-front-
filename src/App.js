// HOOKS
import { useState } from 'react';
import './App.css';
// Component
import Navigation from './component/Navigation/Navigation';
import SignIn from './component/SignIn/SignIn';
import Register from './component/Register/Register';
import Logo from './component/Logo/Logo';
import Rank from './component/Rank/Rank';
import ImageLinkForm from './component/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './component/FaceRecognition/FaceRecognition';
// API
import ParticlesBg from 'particles-bg';

function App() {
  // const [initialState, setInitialState] = useState(
  //   {
  //     input: '',
  //     box: {},
  //     route: 'signin',
  //     isSignedIn: false,
  //     user: {
  //       id: '',
  //       name: '',
  //       email: '',
  //       entries: 0,
  //       joined: ''
  //     }
  //   }
  // );

  const [input, setInput] = useState('');
  // const [imageUrl, setImageUrl] = useState('');
  // const [box, setBox] = useState({});
  const [route, setRoute] = useState('signin');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(
    {
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    });
  const [multiBox, setMultiboxBox] = useState([]);

  const loadUser = (data) => {
    // setInitialState({
    //   ...initialState,
    //   user: {
    //     id: data.id,
    //     name: data.name,
    //     email: data.email,
    //     entries: data.entries,
    //     joined: data.joined
    //   }
    // });
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    });
  }

  const onInputChange = (event) => {
    // this.setState({ input: event.target.value });
    setInput(event.target.value);
  }

  const onButtonSubmit = async () => {
    // need to wait until the imageUrl prop get the input and call API
    // await this.setState({ imageUrl: this.state.input });
    setInput(input);

    // prepart to call API - face detect
    const raw = JSON.stringify({
      "user_app_id": {
        "user_id": "clarifai",
        "app_id": "main"
      },
      "inputs": [
        {
          "data": {
            "image": {
              // "url": imageUrl
              "url": input
            }
          }
        }
      ]
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Key fc2592c9706d4048935b7421080f8924'
      },
      body: raw
    };

    // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
    // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
    // this will default to the latest version_id

    fetch("https://api.clarifai.com/v2/models/face-detection/versions/6dc7e46bc9124c5c8824be4822abe105/outputs", requestOptions)
      .then(response => response.json())
      .then(result => {
        if (result && result.status.description !== 'Failure') {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              // will change whold object              
              setUser(Object.assign(user, { entries: count }))
            });

          // calculateFaceLocation
          console.log('result', result);
          const image = document.getElementById('inputImage');
          const width = Number(image.width);
          const height = Number(image.height);

          // store the border for css
          let arr = [];
          for (let i = 0; i < result.outputs[0].data.regions.length; i++) {
            const multiclarifaiFace = result.outputs[0].data.regions[i].region_info.bounding_box;
            arr[i] = {
              leftCol: multiclarifaiFace.left_col * width,
              topRow: multiclarifaiFace.top_row * height,
              rightCol: width - (multiclarifaiFace.right_col * width),
              bottomRow: height - (multiclarifaiFace.bottom_row * height)
            }
          }
          console.log(arr);
          setMultiboxBox(arr);
        } else {
          // can write some fool-proof design here
          // TODO
          console.log('failure');
        }
      })
      .catch(error => console.log('error', error));
  }

  // casue this.setState need to use arrow function
  const onRouteChange = (route) => {
    if (route === 'signout') {
      setIsSignedIn(false)
    } else if (route === 'home') {
      setIsSignedIn(true)
    }
    setRoute(route)
  }

  return (
    <div className="App">
      <ParticlesBg type="polygon" bg={true} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
      {route === 'home' ?
        <div>
          <Logo />
          <Rank name={user.name} entries={user.entries} />
          <ImageLinkForm onInputChange={onInputChange} onButtonSubmit={onButtonSubmit} />
          <FaceRecognition imageUrl={input} multiBox={multiBox} />
        </div> :
        (
          route === 'signin'
            ? <SignIn loadUser={loadUser} onRouteChange={onRouteChange} />
            : <Register loadUser={loadUser} onRouteChange={onRouteChange} />
          // ? <SignIn onRouteChange={this.onRouteChange} />
          // : <Register onRouteChange={this.onRouteChange} />
        )
      }
    </div>
  );
}

/*class App extends Component {

  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }

  // test if can access ther server or not
  // componentDidMount(){
  //   fetch('http://localhost:3000')
  //   .then(res => res.json())
  //   .then(data => console.log(data));
  // }

  calculateFaceLocation = (data) => {   
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;

    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({ box: box });
  }

  // casue this.setState need to use arrow function
  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  // casue this.setState need to use arrow function
  onButtonSubmit = async () => {
    // need to wait until the imageUrl prop get the input and call API
    await this.setState({ imageUrl: this.state.input });
    // prepart to call API - face detect
    const raw = JSON.stringify({
      "user_app_id": {
        "user_id": "clarifai",
        "app_id": "main"
      },
      "inputs": [
        {
          "data": {
            "image": {
              "url": this.state.imageUrl
            }
          }
        }
      ]
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Key fc2592c9706d4048935b7421080f8924'
      },
      body: raw
    };

    // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
    // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
    // this will default to the latest version_id

    fetch("https://api.clarifai.com/v2/models/face-detection/versions/6dc7e46bc9124c5c8824be4822abe105/outputs", requestOptions)
      .then(response => response.json())
      .then(result => {
        if (result) {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              // will change whold object
              // this.setState({
              //   user: {
              //     entries: count
              //   }
              // })
              this.setState(Object.assign(this.state.user, { entries: count }))
            })
            ;
        }
        this.displayFaceBox(this.calculateFaceLocation(result))
        // this.calculateFaceLocation(result)
      })
      .catch(error => console.log('error', error));
  }

  // casue this.setState need to use arrow function
  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({ isSignedIn: false })
    } else if (route === 'home') {
      this.setState({ isSignedIn: true })
    }
    this.setState({ route: route });
  }


  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <ParticlesBg type="polygon" bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        {this.state.route === 'home' ?
          <div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries} />
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
            <FaceRecognition imageUrl={imageUrl} box={this.state.box} />
          </div> :
          (
            this.state.route === 'signin'
              ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            // ? <SignIn onRouteChange={this.onRouteChange} />
            // : <Register onRouteChange={this.onRouteChange} />
          )
        }
      </div>
    );
  }
}*/

export default App;
