let hint = ''
let guess = ''

function updateWinnerOrLoser(winOrLose, suggestions, guess) {
  if(winOrLose == "FAIL") {
    updateLoser(suggestions)
    hideHint()
    hideGuess()
    hideHeader()
    hideHintText()
    hideWinner()
    return
  }
  if(winOrLose == "WIN") {
    updateWinner(guess)
    hideHint()
    hideGuess()
    hideHeader()
    hideHintText()
    hideLoser()
    return
  }
}

function updateBadge(number) {
  const badgeText = number > 99 ? '99+' : number
  chrome.action.setBadgeText({text: `${badgeText}`})
  chrome.action.setBadgeBackgroundColor({ color: '#538d4e' })
}

function updateHeader(numberOfWordsPossible) {
  const suffix = numberOfWordsPossible > 1 ? 's' : ''
  const grammar = suffix == 's' ? 'are' : 'is'
  document.getElementById('numWords').innerHTML= `There ${grammar} ${numberOfWordsPossible} word${suffix} possible based on your board`;
}

function hideToWordle() {
  document.getElementById('takeMeToWordle').remove()
}

function updateWinner(word) {
  const winningWord = '<p>' + word + '</p'
  document.getElementById('winner').innerHTML="Well done, looks like today's word is:" + winningWord.toUpperCase()
}

function updateLoser(suggestions) {
  var list = ''
  suggestions.forEach(suggestion => list += '<li>' + suggestion.toUpperCase() + '</li>')
  document.getElementById('solution').innerHTML= `Better luck next time, some ideas that might of escaped you... ${list}`
}

function updateHint() {
  document.getElementById('hintButton').style.display = 'none'
  document.getElementById('hint').innerHTML=hint.toString().toUpperCase()
} 

function hideHeader() {
  document.getElementById('numWords').remove()
}

function hideWinner() {
  document.getElementById('winner').remove()
}

function hideLoser() {
  document.getElementById('solution').remove()
}

function hideHint() {
  document.getElementById('hintButton').remove()
}

function hideHintText() {
  document.getElementById('hint').remove()
}

function hideGuess() {
  document.getElementById('guessButton').remove()
}

function guessShow() {
  document.getElementById('hintButton').style.display = ''
  document.getElementById('hint').innerHTML = ''
  chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, 'SOLVE', message => {
      hint = message.hint
      guess = message.guess
      chrome.runtime.sendMessage(message)
      updateBadge(message.numberOfWordsPossible)
      updateHeader(message.numberOfWordsPossible) 
      updateWinnerOrLoser(message.gameStatus, message.suggestions, message.guess)
    })
    return true
   })
} 

const hintButton = document.getElementById('hintButton')
const guessButton = document.getElementById('guessButton')
hintButton.addEventListener('click', updateHint)
guessButton.addEventListener('click', guessShow)

document.addEventListener('DOMContentLoaded', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  await chrome.tabs.sendMessage(tab.id, 'GET_HINT', message => {
    if(message) {
      hintButton.removeAttribute('hidden')
      guessButton.removeAttribute('hidden')
      hint = message.hint
      guess = message.guess
      hideToWordle()
      chrome.runtime.sendMessage(message)
      updateBadge(message.numberOfWordsPossible)
      updateHeader(message.numberOfWordsPossible)
      updateWinnerOrLoser(message.gameStatus, message.suggestions, message.guess)
      return true
    }
  })
})