```` markdown
**FIREBASE**
**Repflow-staging:**
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsFd7X2Q4Lw9Cu-J_LYbVKe75VUJOBCOQ",
  authDomain: "rep-flow-staging.firebaseapp.com",
  projectId: "rep-flow-staging",
  storageBucket: "rep-flow-staging.firebasestorage.app",
  messagingSenderId: "710695887850",
  appId: "1:710695887850:web:9ae8c3afeae930791c4893",
  measurementId: "G-1QDJKY5ZBQ"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

**Repflow-prod:**
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBN4g4cLPLp9y6LtWkEs78oa_NkoS5QLOM",
  authDomain: "rep-flow-prod.firebaseapp.com",
  projectId: "rep-flow-prod",
  storageBucket: "rep-flow-prod.firebasestorage.app",
  messagingSenderId: "1005499185050",
  appId: "1:1005499185050:web:65e5d70940daf2bae3ec23",
  measurementId: "G-BRRB8FXXBZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

**.env Example:**
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=


**RapidAPI**

App: **default-application_10848258**
X-RapidAPI-Key: **b417d919c7mshf9bc0acd476323fp1c3502jsn09112d37d6e**
Request URL: **rapidapi.com**

“GET Avaliable Muscle Groups” snippet and response ✅:
```javascript
import axios from 'axios';

const options = {
  method: 'GET',
  url: '[https://muscle-group-image-generator.p.rapidapi.com/getMuscleGroups](https://muscle-group-image-generator.p.rapidapi.com/getMuscleGroups)',
  headers: {
    'x-rapidapi-key': 'b417d919c7mshf9bc0acd476323fp1c3502jsn09112d37d6ed',
    'x-rapidapi-host': 'muscle-group-image-generator.p.rapidapi.com'
  }
};

try {
         const response = await axios.request(options);
         console.log(response.data);
} catch (error) {
         console.error(error);
}

````

**Exercises**
0:"all"
1:"all\_lower"
2:"all\_upper"
3:"abductors"
4:"abs"
5:"adductors"
6:"back"
7:"back\_lower"
8:"back\_upper"
9:"biceps"
10:"calfs"
11:"chest"
12:"core"
13:"core\_lower"
14:"core\_upper"
15:"forearms"
16:"gluteus"
17:"hamstring"
18:"hands"
19:"latissimus"
20:"legs"
21:"neck"
22:"quadriceps"
23:"shoulders"
24:"shoulders\_back"
25:"shoulders\_front"
26:"triceps"

“GET Single Color Image (Just primary musclegroups)” snippet and response ✅:

``` javascript
import axios from 'axios';

const options = {
  method: 'GET',
  url: '[https://muscle-group-image-generator.p.rapidapi.com/getImage](https://muscle-group-image-generator.p.rapidapi.com/getImage)',
  params: {
    muscleGroups: 'biceps,chest,hamstring',
    color: '200,100,80',
    transparentBackground: '0'
  },
  headers: {
    'x-rapidapi-key': 'b417d919c7mshf9bc0acd476323fp1c3502jsn09112d37d6ed',
    'x-rapidapi-host': 'muscle-group-image-generator.p.rapidapi.com'
  }
};

try {
       const response = await axios.request(options);
       console.log(response.data);
} catch (error) {
       console.error(error);
}

```

“GET Dual Color Image (Primary and secondary musclegroups)” Snippet and response ✅:

``` javascript
import axios from 'axios';
const options = {
  method: 'GET',
  url: '[https://muscle-group-image-generator.p.rapidapi.com/getMulticolorImage](https://muscle-group-image-generator.p.rapidapi.com/getMulticolorImage)',
  params: {
    primaryColor: '240,100,80',
    secondaryColor: '200,100,80',
    primaryMuscleGroups: 'chest',
    secondaryMuscleGroups: 'triceps,shoulders',
    transparentBackground: '0'
  },
  headers: {
    'x-rapidapi-key': 'b417d919c7mshf9bc0acd476323fp1c3502jsn09112d37d6ed',
    'x-rapidapi-host': 'muscle-group-image-generator.p.rapidapi.com'
  }
};

try {
       const response = await axios.request(options);
       console.log(response.data);
} catch (error) {
       console.error(error);
}

```

Get Individual Color Image (Set color for each muscle) Snippet and response ✅:

``` javascript
import axios from 'axios';

const options = {
  method: 'GET',
  url: '[https://muscle-group-image-generator.p.rapidapi.com/getIndividualColorImage](https://muscle-group-image-generator.p.rapidapi.com/getIndividualColorImage)',
  params: {
    muscleGroups: 'chest,triceps,shoulders',
    colors: 'ff0000,0f0,00f',
    transparentBackground: '0'
  },
  headers: {
    'x-rapidapi-key': 'b417d919c7mshf9bc0acd476323fp1c3502jsn09112d37d6ed',
    'x-rapidapi-host': 'muscle-group-image-generator.p.rapidapi.com'
  }
};

try {
       const response = await axios.request(options);
       console.log(response.data);
} catch (error) {
       console.error(error);
}

```

Get Base Image Snippet and response ✅:

``` javascript
import axios from 'axios';
const options = {
  method: 'GET',
  url: '[https://muscle-group-image-generator.p.rapidapi.com/getBaseImage](https://muscle-group-image-generator.p.rapidapi.com/getBaseImage)',
  params: {
    transparentBackground: '0'
  },
  headers: {
    'x-rapidapi-key': 'b417d919c7mshf9bc0acd476323fp1c350

```
