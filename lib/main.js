const config = {
  apiKey: "AIzaSyBGCQtsALb72u_zu2GXitjMzP8SeTZ5awU",
  authDomain: "bubbles-31701.firebaseapp.com",
  databaseURL: "https://bubbles-31701.firebaseio.com",
  projectId: "bubbles-31701",
  storageBucket: "bubbles-31701.appspot.com",
  messagingSenderId: "458963947314"
}
firebase.initializeApp(config)

const startButton = document.querySelector('.js-start-button')

startButton.addEventListener('click', function (evt) {
  startButton.hidden = true
  firebase.auth().signInAnonymously().catch(function(error) {
    console.log(error.code, error.message)
  })
})

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    startButton.remove()
    start()
  } else {
    startButton.hidden = false
  }
})

function start () {
  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('js-removeable')) {
      const ref = firebase.database().ref(`dots/${event.target.id.match(/dot-(.+)/)[1]}`)
      ref.remove()
    } else {
      const newRef = firebase.database().ref('dots').push().key
      firebase.database().ref(`dots/${newRef}`).set({
        x: event.pageX,
        y: event.pageY,
        strength: parseFloat((Math.random() * 10).toFixed(1)),
        hue: Math.round(Math.random() * 360),
        lightness: Math.round(Math.random() * 30),
        userId: firebase.auth().currentUser.uid
      })
    }
  })

  const messagesRef = firebase.database().ref('dots')
  messagesRef.on('child_added', addDot)
  messagesRef.on('child_removed', removeDot)
}

function addDot (data) {
  if (data.val().userId === firebase.auth().currentUser.uid) {
    var dot = document.createElement('button')
    dot.type = "button"
    dot.classList.add('js-removeable')
    dot.textContent = 'YOU'
  } else {
    var dot = document.createElement('div')
  }

  dot.id = `dot-${data.key}`
  dot.classList.add('dot')
  dot.style.top = `${data.val().y}px`
  dot.style.left = `${data.val().x}px`
  dot.style.transform = `scale(${data.val().strength * 0.7}, ${data.val().strength * 0.7})`
  dot.style.backgroundColor = `hsla(${data.val().hue}, 100%, ${2 * data.val().lightness}%, 0.5)`

  document.body.appendChild(dot)
}

function removeDot (data) {
  document.getElementById(`dot-${data.key}`).remove()
}
