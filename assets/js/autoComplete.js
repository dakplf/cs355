// Stores the selected schools in this array
var selectedSchools = []

// Stores the details of each selected school
var transferDetailList = []

// Stores the selected TRANSFER schools in this array
var selectedTransferSchools = []

// Stores all the courses for the specific school
// course_list['school' + schoolCode] is the value
// ['school' + schoolCode] is the key 
var course_list = []


// * this becomes a promise that holds a list of CUNY colleges
let collegeList

// Save the "add school button" as a variable to be easily accessed later
const addSklBtn = document.getElementById('add-school-btn')

let userColleges = [
  {
    NAME: 'Baruch COllege',
    CODE: 'BU101',
    COURSES: []
  }
]

/**
 * Class that will store all user selected info such as:
 *  - Selected school & its courses
 *  - Selected transfer school and intended major
 *  - Selected exams and scores
 * Will be used to compute result
 */
class TransferDetail {
  courses = [];
  major;

  constructor(schoolName, schoolCode) {
    this.school = {'schoolName': schoolName, 'schoolCode': schoolCode}
  }

  addCourses(courseName, courseCode) {
    this.courses.push({'courseName': courseName, 'courseCode': courseCode})
  }

  addMajor(majorName, majorCode) {
    this.major = {'majorName': majorName, 'majorCode': majorCode}
  }

  getSchool() {
    return this.school
  }

  getCourses() {
    return this.courses
  }

  getMajor() {
    return this.major
  }
}

// * Clear input fields on load
// ? mimics $(document).ready()
// ? if(document.addEventListener) returns false if there are no addEventListeners on document
function ready(fn) {
  if (typeof fn === 'function') {
    if (document.readyState !== 'loading') {
      fn()
    } else if (document.addEventListener) {
      document.addEventListener('DOMContendLoaded', fn())
    } else {
      document.attachEvent('onreadystatechange', () => {
        if (document.readyState !== 'loading') {
          fn()
        }
      })
    }
  }
}

$(document).ready(function () {
  initEvents();
})

function initEvents() {
  $("#add-school-btn").on('click', addAnotherSchool);
  $("#add-transfer-school-btn").on('click', addAnotherTransferSchool);
  $("#courses-panel").on('click', '.school-added-container a.close', deleteSelectedSchool);
  $("#courses-panel").on('click', '.add-school-container a.close', deleteSchoolInputContainer);
  $("#courses-panel").on('click', '.course a.delete-course-btn', deleteSelectedCourse)
  $("#courses-panel").on('click', 'a.close-course-input', deleteCourseInputContainer);
  $("#courses-panel").on('click', '.add_course', toggleCourseForm);
  $(".done-adding-schools").on('click', goToCollegeOption);

  $("#college-opt-panel").on('click', '.transfer-school-added-container a.close', deleteSelectedTransferSchool);
  $("#college-opt-panel").on('click', '.add-transfer-school-container a.close', deleteTransferSchoolInputContainer);
}

// * clears the inputfields when refreshing! add class text-field to your input text elements... ** if you need anything to load when DOM load, write it here
window.ready(() => {
  const allInputFields = document.querySelectorAll('.text-field')
  allInputFields.forEach(field => {
    field.value = ''
  })
  document.addEventListener('click', event => {
    console.log(event.target)
  })
})

/**
 * COURSES PANEL
 * Handles button clicked to add "add school" container
 *  - Fetches all CUNY colleges from database
 */
function addAnotherSchool() {
  if (selectedSchools.length < 3) {
    addSklBtn.style.display = 'none'

    var newAddSchoolContainer = $("<div class='add-school-container' style='display: block; display: none;'> <div class='add-school-input-container'> <input class='school-text-field' type='text' placeholder='Type School Name' oninput='handleSchoolNameInput(this)' onblur='hideSchoolList(this)' onfocus='handleSchoolNameInput(this)'> <div class='school-ac-panel hidden'> <ul class='school-input-ac-1'></ul> </div> </div> <a class='close'> <img src='../../style/images/close-button.svg' alt='close button' class='close-button' align='middle'/> </a> <div class='pastMenuItems'> </div> <div class='dropdown-header pastEmpty' style='display: none;'>No schools found</div> </div>");
    $(newAddSchoolContainer).insertBefore('.school-added-container')
    newAddSchoolContainer.show()

    collegeList = colList()
  }
}

async function colList() {
  const temp = await fetch('/colleges')
  const res = await temp.json()
  return res
}

/**
 * COURSES PANEL
 * Hides the school search dropdown menu when user clicks outside of it
 * @param {DOM Object} element 
 */
function hideSchoolList(element) {
  var panel = $(element).next(".school-ac-panel")
  if (!$(".school-input-ac-1:hover").length) {
    $(panel).hide();
  }
}

/**
 * COURSES PANEL
 * Filters and shows only the schools that matches the user input
 * @param {String} name 
 * @param {DOM Object} element 
 */
function matchSchool(name, element) {
  var schoolIp = $(element).next(".school-ac-panel")[0]
  var schoolAC = $(element).next(".school-ac-panel").children(".school-input-ac-1")[0]
  schoolAC.innerHTML = ''
  collegeList.then(x => {
    let matches = x.filter(college => {
      const regex = new RegExp(`${name}`, 'gi')
      return college.NAME.match(regex)
    })
    if (matches.length === 0) {
      let tempinput = document.createElement('input')
      tempinput.type = 'button'
      tempinput.className = 'school-option'
      tempinput.value = "Sorry, the school you have entered was not found in our system."
      tempinput.style.textAlign = "center"
      let templi = document.createElement('li')
      templi.className = 'disable-select-school'
      templi.appendChild(tempinput)
      schoolAC.appendChild(templi);
      schoolIp.style.display = 'block'
    }
    matches.forEach(college => {
      let tempinput = document.createElement('input')
      tempinput.type = 'button'
      tempinput.className = 'school-option'
      tempinput.setAttribute('data-school-code', college.Code)
      tempinput.value = college.NAME
      let templi = document.createElement('li')

      // Checks if school is already selected
      if (selectedSchools.includes(college.NAME)) {
        templi.className = 'disable-select-school'
      }

      templi.appendChild(tempinput)

      templi.addEventListener('click', event => {
        addSchoolPanel(event.target)
      })

      schoolAC.appendChild(templi);
      schoolIp.style.display = 'block'
    })
  })
}

/** 
 * COURSES PANEL
 * This function is called when user selects a school from the dropdown
 *  - Create a "school" div that contains the name of the selected school
 *  - The div allows students to add courses from that school
 *  - The courses from that school are populated into a dropdown list
 */ 
function addSchoolPanel(element) {
  let name = element.value;
  let schoolCode = $(element).attr('data-school-code')
  selectedSchools.push(name);

  // Create object for this selected school
  let transferDetail = new TransferDetail(name, schoolCode)
  transferDetailList.push(transferDetail)
  console.log("TESTING SCHOOL CODE "+transferDetailList[0].getSchool().schoolCode)

  
  var selectedSchool = $("<div class='school' id='" + name + "' data-school-code='"+ schoolCode +"'> <h2> <span></span> " + name + " </h2> <a class='close'> <img src='style/images/close-button.svg' alt='close button' class='close-button' align='middle'/> </a> </div>");
  var selectedSchoolTEST = $("<div class='school' id='" + name + "' data-school-code='"+ schoolCode +"'> <h2> <span></span> " + name + " </h2> <a class='close'> <img src='style/images/close-button.svg' alt='close button' class='close-button' align='middle'/> </a> <div class='course_container'><a class='add_course'>+ Add Course</a><div class='add_course_container'><div class='add_course_input_container'><input class='add_course_input' type='text' placeholder='Type Course Name' oninput='handleCourseNameInput(this)' onfocus='handleCourseNameInput(this)' onblur='hideCourseList(this)' /> <div class='not_found' style='display:none;'>Sorry, the course you've entered was not found in our system.</div> <div class='course_list'> </div> </div> <a class='close-course-input' /> </div><div class='selected_courses' /></div></div>");

  var selectedSchoolTESTwithcollapse = $("<div class='school' id='" + name + "' data-school-code='"+ schoolCode +"'> <h2> <span></span> " + name + " </h2> <a class='close'> <img src='style/images/close-button.svg' alt='close button' class='close-button' align='middle'/> </a> <div class='course_container'><a class='add_course'>+ Add Course</a><div class='add_course_container'><div class='add_course_input_container'><input class='add_course_input' type='text' placeholder='Type Course Name, Subject, or Number' oninput='handleCourseNameInput(this)' onblur='hideCourseList(this)' onfocus='handleCourseNameInput(this)' /><div class='course_list' /></div><a class='course_close' /></div><div class='selected_courses' /><span class='collapse'>Collapse This Window</span></div></div>");

  $('.school-added-container').append(selectedSchoolTEST);

  $('.add-school-container').remove();
  $('#add-school-btn').insertBefore($('.school-added-container'));
  if (selectedSchools.length < 3) {
    $('#add-school-btn').show();
  }

  var courseList = $(selectedSchoolTEST).find(".course_list");
  course_list['school' + schoolCode] = []

  $.ajax({
    type: 'GET',
    url: "/TRNS_RULES/" + name,
    dataType: "json",
    success: function(data) {
      console.log("SUCCESS")
      course_list['school' + schoolCode] = []
      for (let course of data) {
        if (!course_list['school' + schoolCode].includes(course.CourseName.toLowerCase())) {
          // Store all the courses in a 'key value pair' object for that specific school
          course_list['school' + schoolCode].push(course.CourseName.toLowerCase())
          // var $option = $("<a data-id='" + course.CourseID + "'>" + course.SchoolSubject + " " + course.CourseID + " - " + course.CourseName + "</a>");
          var $option = $("<a data-id='" + course.CourseID + "'>" + course.CourseName + "</a>");
          $(courseList).append($option);
        }
      }
    }
  })
}

/**
 * COURSES PANEL
 * This function is triggered when user selects a course from the dropdown
 *  - Checks if selected course has already been added
 *  - Only proceed to add course if above is false
 */
function handleAddCoursePanel() {
  let addCourseContainer = $(this).parents('.add_course_container')[0]
  let selectedCourses = $(addCourseContainer).siblings('.selected_courses')[0]
  let dataId = $(this).attr('data-id')
  if (!$(selectedCourses).children("[data-id='" + dataId + "']").length > 0) {
    addCoursePanel(this)
    $(addCourseContainer).find('.add_course_input').val('')
  }
}

/**
 * COURSES PANEL
 * Add course
 *  - Create div for selected course
 *  - Add course to its respective school in TransferDetail object
 * @param {DOM Object} element 
 */
function addCoursePanel(element) {
  let name = $(element).text();
  let courseCode = $(element).attr('data-id')

  let school = $(element).parents('.school')[0]
  let schoolCode = $(school).data('school-code')
  let thisSchool;

  for (var i = 0; i < transferDetailList.length; i++) {
    if (transferDetailList[i].getSchool().schoolCode === schoolCode) {
      thisSchool = transferDetailList[i]
      break;
    }
  }
  thisSchool.addCourses(name, courseCode)

  $(element).attr("data-selected", "true")

  var selectedCourse = $("<div class='course' data-id='" + courseCode + "' >" + name + "<a class='delete-course-btn' /> </a> </div>")
  $(element).closest('.school').find('.selected_courses').prepend(selectedCourse)

  $(element).parent().hide()
  $(element).parent().siblings('.not_found').hide()

  var $container = $(element).closest('.course_container')
  $container.find(".add_course").toggle()
  $container.find(".add_course_container").toggle()
}

/**
 * COURSES PANEL
 * Handles showing/hiding of "add course" options
 */
function toggleCourseForm() {
  var $container = $(this).closest('.course_container')
  $container.find(".add_course").toggle()
  $container.find(".add_course_container").toggle()
  $container.find(".add_course_input").val("").filter(":visible").focus()
}
/**
 * COURSES PANEL
 * Handle user course search input
 * @param {DOM Object} element 
 */
function handleCourseNameInput(element) {
  let courseList = $(element).siblings('.course_list')[0]
  let notFound = $(element).siblings('.not_found')[0]
  if (element.value.length >= 1) {
    matchCoursesFromInput(element)
  } else {
    $(courseList).hide()
    $(notFound).hide()    
  }
}

/**
 * COURSES PANEL
 * Filters and shows only the courses that matches the user input
 * @param {DOM Object} element 
 */
function matchCoursesFromInput(element) {
  var $this = $(element)
  var $list = $this.siblings('.course_list')
   
  var $not_found = $this.siblings('.not_found')
  var not_found = $not_found[0]
  var list = $list[0]
  list.style.top = '72px'

  var id = $this.closest('.school').attr('data-school-code');
  var val = $this.val().toLowerCase();
  var links = list.getElementsByTagName("a");

  for(var i = 0; i < course_list['school' + id].length; i++){
    links[i].className = course_list['school' + id][i].indexOf(val) != -1 ? 'visible' : '';
    links[i].addEventListener('click', handleAddCoursePanel)
  }

  var visible_links = list.getElementsByClassName('visible');
  if(visible_links.length){
    if(visible_links.length == 1){
      visible_links[0].className = 'visible selected';
    }
    list.scrollTop = 0;
    $("#course_not_listed_" + $this.attr('data-school-id')).remove()

    list.style.display = 'block';
    list.style.top = '39px';
    not_found.style.display = 'none';
    $this.attr("original_value",$this.val());
  } else {
    $(list).hide()
    not_found.style.display = 'block';
    $this.attr("original_value",$this.val());
  }
}

/**
 * COURSES PANEL
 * Hide dropdown menu when user clicks outside of the dropdown menu
 * @param {DOM Object} element 
 */
function hideCourseList(element) {
  var panel = $(element).closest(".course_container")
  if (!panel.find('.course_list:hover, .not_found:hover').length) {
    panel.find('.course_list').hide()
    panel.find('.not_found').hide() 
  }
}

/**
 * COURSES PANEL
 * Handles user school search input
 * @param {DOM Object} element 
 */
function handleSchoolNameInput(element) {
  var schoolAC = $(element).next(".school-ac-panel").children(".school-input-ac-1")[0]
  var schoolIp = $(element).next(".school-ac-panel")[0]
  if (element.value.length >= 1) {
    matchSchool(element.value, element)
  } else {
    schoolAC.innerHTML = ''
    schoolIp.style.display = 'none'
  }
}

/**
 * COURSES PANEL
 * Called when user clicks on "x" of a selected school
 *  - Delete school div
 *  - Delete school from the "selectedSchool" array
 *  - Delete school's TransferDetail object from the "transferDetailList" array
 *  - Delete all courses related to that school stored in "course_list" array
 */
function deleteSelectedSchool() {
  var $this = $(this)
  var $school = $this.closest('.school')
  $school.remove()
  var schoolName = ($($school).attr("id"))
  var schoolCode = ($($school).attr("data-school-code"))

  for (var i = 0; i < selectedSchools.length; i++) {
    if (selectedSchools[i] === schoolName) {
      selectedSchools.splice(i, 1);
    }
  }

  for (var i = 0; i < transferDetailList.length; i++) {
    if (transferDetailList[i].getSchool().schoolCode === schoolCode) {
      transferDetailList.splice(i, 1);
    }
  }

  // delete all the courses loaded for that specific school 
  delete course_list['school' + schoolCode]

  if (selectedSchools.length < 3) {
    if (!($('#courses-panel').find('.add-school-container').length)) {
      $('#add-school-btn').insertBefore($('.school-added-container'))
      $('#add-school-btn').show()
    }
  }
}

/**
 * COURSES PANEL
 * Called when user clicks on "x" of a selected course
 *  - Delete course div
 *  - Delete the course from its respective school in TransferDetail object
 */
function deleteSelectedCourse() {
  var $this = $(this)
  var $course = $this.closest('.course')
  var schoolCode = $this.closest('.school').attr('data-school-code')
  var courseCode = $this.parent().attr('data-id')
  var courseContainer = $this.parents('.course_container')[0]
  $(courseContainer).find(".course_list a[data-id='" + courseCode + "']").removeAttr("data-selected")

  for (var i = 0; i < transferDetailList.length; i++) {
    if (transferDetailList[i].getSchool().schoolCode === schoolCode) {
      let courseList = transferDetailList[i].getCourses()
      for (var j = 0; j < courseList.length; j++) {
        if (courseList[j].courseCode === courseCode) {
          console.log("REMOVING THIS COURSE: " + courseList[j].courseName)
          courseList.splice(j, 1)
          console.log("AFTER REMOVING COURSE LIST SIZE: " + courseList.length)
        }
      }
    }
  }
  $course.remove()
}

/**
 * COURSES PANEL
 * Called when user clicks on "x" next to school search input
 */
function deleteSchoolInputContainer() {
  $(this).parent().remove()

  if (selectedSchools.length < 3) {
    $('#add-school-btn').insertBefore($('.school-added-container'))
    $('#add-school-btn').show()
  }
}

function goToCollegeOption() {
  $('#transfer-nav-container #college-opt').click();
}

/**
 * COURSES PANEL
 * Called when user clicks on "x" next to course search input
 */
function deleteCourseInputContainer() {
  var $container = $(this).closest('.course_container')
  $container.find(".add_course").toggle()
  $container.find(".add_course_container").toggle()
}

/**
 * COLLEGE OPTION PANEL
 * Handles button clicked to add "add school" container
 *  - Fetches all CUNY colleges from database
 */
function addAnotherTransferSchool() {
  $('#add-transfer-school-btn').hide();
  var newAddSchoolContainer = $("<div class='add-transfer-school-container' style='display: block; display: none;'> <div class='add-transfer-school-input-container'> <input class='transfer-school-text-field' type='text' placeholder='Type School Name' oninput='handleTransferSchoolNameInput(this)' onblur='hideTransferSchoolList(this)' onfocus='handleTransferSchoolNameInput(this)'> <div class='transfer-school-ac-panel hidden'> <ul class='transfer-school-input-ac'></ul> </div> </div> <a class='close'> <img src='../../style/images/close-button.svg' alt='close button' class='close-button' align='middle'/> </a> </div>");
  $(newAddSchoolContainer).insertBefore('.transfer-school-added-container')
  newAddSchoolContainer.show()
  collegeList = colList()
}

/**
 * COLLEGE OPTION PANEL
 * Handles user school search input
 * @param {DOM Object} element 
 */
function handleTransferSchoolNameInput(element) {
  var schoolAC = $(element).next(".transfer-school-ac-panel").children(".transfer-school-input-ac")[0]
  var schoolIp = $(element).next(".transfer-school-ac-panel")[0]
  if (element.value.length >= 1) {
    matchTransferSchool(element.value, element)
  } else {
    schoolAC.innerHTML = ''
    schoolIp.style.display = 'none'
  }
}

/**
 * COLLEGE OPTION PANEL
 * Filters and shows only the schools that matches the user input
 * @param {String} name 
 * @param {DOM Object} element 
 */
function matchTransferSchool(name, element) {
  let schoolIp = $(element).next(".transfer-school-ac-panel")[0]
  let schoolAC = $(element).next(".transfer-school-ac-panel").children(".transfer-school-input-ac")[0]
  schoolAC.innerHTML = ''
  collegeList.then(x => {
    let matches = x.filter(college => {
      const regex = new RegExp(`${name}`, 'gi')
      return college.NAME.match(regex)
    })
    if (matches.length === 0) {
      let tempinput = document.createElement('input')
      tempinput.type = 'button'
      tempinput.className = 'school-option'
      tempinput.value = "Sorry, the school you have entered was not found in our system."
      let templi = document.createElement('li')
      templi.className = 'disable-select-school'
      templi.appendChild(tempinput)
      schoolAC.appendChild(templi);
      schoolIp.style.display = 'block'
    }
    matches.forEach(college => {
      let tempinput = document.createElement('input')
      tempinput.type = 'button'
      tempinput.className = 'school-option'
      tempinput.value = college.NAME
      let templi = document.createElement('li')

      // Checks if school is already selected
      if (selectedSchools.includes(college.NAME)) {
        templi.className = 'disable-select-school'
      }

      templi.appendChild(tempinput)

      templi.addEventListener('click', event => {
        addTransferSchoolPanel(event.target.value)
      })

      schoolAC.appendChild(templi);
      schoolIp.style.display = 'block'
    })
  })
}

function addTransferSchoolPanel(name) {
  selectedTransferSchools.push(name);
  let selectedTransferSchool = $("<div class='transfer-school' id='" + name + "'> <h2> <span></span> " + name + " </h2> <a class='close'> <img src='style/images/close-button.svg' alt='close button' class='close-button' align='middle'/> </a> </div>");
  $('.transfer-school-added-container').append(selectedTransferSchool);
  $('.add-transfer-school-container').remove();
  $('#add-transfer-school-btn').insertBefore($('.transfer-school-added-container'));
  if (selectedTransferSchools.length < 1) {
    $('#add-transfer-school-btn').show();
  }
}

/**
 * COLLEGE OPTION PANEL
 * Called when user clicks on "x" of a selected school
 */
function deleteSelectedTransferSchool() {
  let $this = $(this)
  let $transferSchool = $this.closest('.transfer-school')
  $transferSchool.remove()
  var transferSchoolName = ($($transferSchool).attr("id"))

  for (var i = 0; i < selectedTransferSchools.length; i++) {
    if (selectedTransferSchools[i] === transferSchoolName) {
      selectedTransferSchools.splice(i, 1);
    }
  }

  if (selectedTransferSchools.length < 1) {
    if (!($('#college-opt-panel').find('.add-transfer-school-container').length)) {
      $('#add-transfer-school-btn').insertBefore($('.transfer-school-added-container'))
      $('#add-transfer-school-btn').show()
    }
  }
}

function deleteTransferSchoolInputContainer() {
  $(this).parent().remove()

  if (selectedTransferSchools.length < 1) {
    $('#add-transfer-school-btn').insertBefore($('.transfer-school-added-container'))
    $('#add-transfer-school-btn').show()
  }
}






// ! TEST SCORE SECTION
//? fetch example

async function fetchExams() {
  const res = await fetch('/EXAMS/')
  const arr = await res.json()


  console.log(arr)
}

// ? post example:: open up console in your browswer and type in : postGibberish() to see post in motion

async function postGibberish() {
  const dataToBeSent = {
    name: "Paul Chon",
    hp: 14,
    class: "homeless man"
  }
  const options = {
    method: 'POST',
    body: JSON.stringify(dataToBeSent),
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const res = await fetch('/SEND_ME_TO_SPACE/', options)

  const json = await res.json()
  console.log(json)

} 