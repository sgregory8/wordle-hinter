function getRandomAndRemove(array) {
  return array.splice(Math.floor(Math.random()*array.length), 1)[0];
}

function howManyRepeated(str){
  try{ return str.toLowerCase().split("").sort().join("").match(/(.)\1+/g).length; }
  catch(e){ return 0; } // if TypeError
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function solve() {
  let { boardState = [], evaluations = [], gameStatus } = JSON.parse(window.localStorage['nyt-wordle-state']);
  let words = ANSWER_WORDS
  let hints = ["_", "_","_", "_", "_"]
  boardState.forEach((element, index) => {
    if(element.length == 5) {
      evaluations[index].forEach((result, index) => {
        const char = element.charAt(index)
        if(result == 'present') {      
          words = words.filter(word => word.charAt(index) != char)
          words = words.filter(word => word.indexOf(char) != -1)
        } 
        else if (result == 'absent') {
          if(howManyRepeated(element) > 0) {
            words = words.filter(word => word.charAt(index) != char)
          } else {
            words = words.filter(word => word.indexOf(char) == -1)
          }
        }
        else if (result == 'correct') {
          hints[index] = char
          words = words.filter(word => word.charAt(index) == char)
        }
      })
    }
  })
  const nonHintindexes = []
  hints.forEach((item, index) => {
    if(item == '_') {
      nonHintindexes.push(index)
    }
  })
  const guess = words[Math.floor(Math.random()*words.length)]

  if(nonHintindexes.length == 5) {
    // give three char hints
    let index = getRandomAndRemove(nonHintindexes)
    hints[index] = guess.charAt(index)
    index = getRandomAndRemove(nonHintindexes)
    hints[index] = guess.charAt(index)
    index = getRandomAndRemove(nonHintindexes)
    hints[index] = guess.charAt(index)
  }
  else if(nonHintindexes.length == 4) {
    // give two char hints
    let index = getRandomAndRemove(nonHintindexes)
    hints[index] = guess.charAt(index)
    index = getRandomAndRemove(nonHintindexes)
    hints[index] = guess.charAt(index)
  }
  else if(nonHintindexes.length == 3) {
    // give one additional char hint
    let index = getRandomAndRemove(nonHintindexes)
    hints[index] = guess.charAt(index)
  }
  else if(nonHintindexes.length == 2) {
    // give one additional char hint
    let index = getRandomAndRemove(nonHintindexes)
    hints[index] = guess.charAt(index)
  }
  else {
    hints = "You really don't need this..."
  }
  return {guess: guess, hint: hints, numberOfWordsPossible: words.length, suggestions: shuffle(words).slice(0,10), gameStatus}
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const answerObj = solve()
  if(request == 'GET_HINT') {
    sendResponse(answerObj)
  } else if (request == 'SOLVE') {
    KEY_MAPPINGS.get('delete').click()
    KEY_MAPPINGS.get('delete').click()
    KEY_MAPPINGS.get('delete').click()
    KEY_MAPPINGS.get('delete').click()
    KEY_MAPPINGS.get('delete').click()
    KEY_MAPPINGS.get(answerObj.guess.charAt(0)).click()
    KEY_MAPPINGS.get(answerObj.guess.charAt(1)).click()
    KEY_MAPPINGS.get(answerObj.guess.charAt(2)).click()
    KEY_MAPPINGS.get(answerObj.guess.charAt(3)).click()
    KEY_MAPPINGS.get(answerObj.guess.charAt(4)).click()
    KEY_MAPPINGS.get('enter').click()
    sendResponse(solve())
  } else {
    sendMessage(solve())
  }
})