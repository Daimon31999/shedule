const COLOR = require('./color')
const { time } = require('console')

const timer = (
  minutes,
  para,
  time_text = `${COLOR.FORE_PURPLE_BOLD}time:${COLOR.RESET}`,
  para_text = `${COLOR.FORE_CYAN_BOLD}para:${COLOR.RESET}`,
  timetable
) => {
  let count = 0
  return new Promise((resolve) => {
    function x() {
      let seconds = minutes * 60 * 1000 // 5 min * 60 sec * 1000 millisec
      let date = new Date(seconds - 180 * 60 * 1000)
      date = parseInt(date.getTime(), 10) - count // translate time in number and subtract
      date = new Date(date) // get new date from previous result

      let timetable_arr = timetable.split('\n')

      console.clear()
      
      let str = 
      `
${(1 === para ? `${COLOR.FORE_RED_BOLD}1) ${timetable_arr[0]} < ${COLOR.RESET}`: `1) ${timetable_arr[0]}`)}
${(2 === para ? `${COLOR.FORE_RED_BOLD}2) ${timetable_arr[1]} < ${COLOR.RESET}`: `2) ${timetable_arr[1]}`)}
${(3 === para ? `${COLOR.FORE_RED_BOLD}3) ${timetable_arr[2]} < ${COLOR.RESET}`: `3) ${timetable_arr[2]}`)}
${(4 === para ? `${COLOR.FORE_RED_BOLD}4) ${timetable_arr[3]} < ${COLOR.RESET}`: `4) ${timetable_arr[3]}`)}
${(5 === para ? `${COLOR.FORE_RED_BOLD}5) ${timetable_arr[4]} < ${COLOR.RESET}`: `5) ${timetable_arr[4]}`)}

${COLOR.FORE_RED_BOLD}${para}${COLOR.RESET} ${para_text} | ${time_text} ${COLOR.FORE_ORANGE_BOLD}${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}${COLOR.RESET}
`
      console.clear()
      console.log(str)

      if (count === seconds) {
        resolve(1) // 1 = ok
        clearInterval(myVar)
      }
      count += 1000 // add 1 second
    }

    // prints timer instantly
    let myVar = setInterval(x, 1000)
  })
}

const between = (date, hmin, mmin, hmax, mmax) => {
  let hour = date.hour
  let minutes = date.minutes
  hmin = parseInt(hmin)
  mmin = parseInt(mmin)
  hmax = parseInt(hmax)
  mmax = parseInt(mmax)

  let current_date = new Date(hour * 60 * 60 * 1000 + minutes * 60 * 1000)
  let max_date = new Date(hmax * 60 * 60 * 1000 + mmax * 60 * 1000)
  let min_date = new Date(hmin * 60 * 60 * 1000 + mmin * 60 * 1000)

  let date_max_difference = max_date.getTime() - current_date.getTime()
  let date_min_difference = current_date.getTime() - min_date.getTime()

  // урок
  if (date_max_difference >= 0 && date_min_difference >= 0 ) {
    return 1
  }
  // перемена
  else if(date_max_difference > -600000 && date_max_difference < 500) {
  return 0    
  }
  // не попал
  else return -1
}

const app = async () => {
  // узнать какая сейчас пара
  let date = { hour: new Date().getHours(), minutes: new Date().getMinutes() }
  date.hour = 9
  date.minutes = 35
  let para = 1

  // Пары еще не начались (12:00 - 8:00)
  if (between(date, 23, 59, 7, 59) === 1) {
    console.clear()
    console.log(`${COLOR.FORE_GREEN_BOLD}Пары еще не начались 🤗${COLOR.RESET}`)
    process.exit()
  }

  // Пары закончились (16:11 - 24:00)
  if (between(date, 16, 11, 23, 59) === 1) {
    console.clear();
    console.log(`${COLOR.FORE_GREEN_BOLD}Пары закончились 🖕${COLOR.RESET}`)
    process.exit()
  }

  // Прочитать timetable.txt в timetable
  let fs = require('fs')
  let timetable = fs.readFileSync('timetable.txt', 'utf8')
  let cp_timetable = timetable.split('\n')
  let time_remaining = 0

  // Считать время перемены
  const peremena = (para) => {
    let row1 = cp_timetable[para - 1]
    let row2 = cp_timetable[para]  
    try {  
      // hmax = 9
      var hmax1 = row1.split('-')[1].split(':')[0]
      // mmax = 30
      var mmax1 = row1.split('-')[1].split(':')[1]

      // hmax = 9
      var hmax2 = row2.split('-')[0].split(':')[0]
      // mmax = 40
      var mmax2 = row2.split('-')[0].split(':')[1]

    } catch {
      // Пары закончились
      console.clear()
      console.log(`\n${COLOR.FORE_GREEN_BOLD}Иди домой 🤟🥳${COLOR.RESET}`)
      process.exit()
    }

    var date1 = new Date((hmax1 * 60 * 60 * 1000) + (mmax1 * 60 * 1000)).getTime()
    var date2 = new Date((hmax2 * 60 * 60 * 1000) + (mmax2 * 60 * 1000)).getTime()

    var diff = Math.abs(date2 - date1)
    diff = new Date(diff).getMinutes()
    return diff
  }
  

  for (let i = 0; i < cp_timetable.length; i++) {
    // row = 8:00-9:30
    let row = cp_timetable[i]
    // hmin = 8
    let hmin = row.split('-')[0].split(':')[0]
    // mmin = 00
    let mmin = row.split('-')[0].split(':')[1]
    // hmax = 9
    let hmax = row.split('-')[1].split(':')[0]
    // mmax = 30
    let mmax = row.split('-')[1].split(':')[1]
    // урок
    if (between(date, hmin, mmin, hmax, mmax) === 1) {
      // Посчитать сколько осталось до конца пары
      // 11:10 - 10:40 = 30
      let time_current = new Date((date.hour * 60 * 60 * 1000) + (date.minutes * 60 * 1000))
      let time_max = new Date((hmax * 60 * 60 * 1000) + (mmax * 60 * 1000))

      time_remaining = new Date(time_max.getTime() - time_current.getTime())
      time_remaining = ((time_remaining.getHours() - 3) * 60 ) + time_remaining.getMinutes()

      // i + 1 т.к i начинается с нуля
      para = i + 1
      break
    }
    // перемена
    else if (between(date, hmin, mmin, hmax, mmax) === 0) {
      let time_current = new Date((date.hour * 60 * 60 * 1000) + (date.minutes * 60 * 1000))
      let time_max = new Date((hmax * 60 * 60 * 1000) + (mmax * 60 * 1000))

      time_remaining = new Date(Math.abs(time_max.getTime() - time_current.getTime()))
      time_remaining = ((time_remaining.getHours() - 3) * 60 ) + time_remaining.getMinutes()

      time_remaining = Math.abs(peremena(para) - time_remaining)

      // i + 1 т.к i начинается с нуля
      para = i + 1

      await timer(time_remaining, para++, 'осталось', 'перемена', timetable)
      time_remaining = 90
      break
    }
  }

  while (para < 6) {
    await timer(time_remaining, para, `осталось`, `пара`, timetable)
    await timer(peremena(para), para++, 'осталось', 'перемена', timetable)
    // await timer(0.05, para, `осталось`, `пара`, timetable)
    // await timer(peremena(para), para++, 'осталось', 'перемена', timetable)
  }
  // Пары закончились
  console.clear()
  console.log(`\n${COLOR.FORE_GREEN_BOLD}Иди домой 🤟🥳${COLOR.RESET}`)
}

app()
