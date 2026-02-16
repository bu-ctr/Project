// backend/src/services/matcher.js

/**
 * Lightweight rule-based matcher.
 * Input: profile (object), criteria (object)
 * Returns: { eligible: boolean, score: number }
 *
 * Criteria keys supported:
 * - gpa_min
 * - course_in (array)
 * - year_in (array)
 * - max_income
 * - caste_in (array)
 * - disability_required (bool)
 * - country_in (array)
 * - state_in (array)
 * - min_10_percentage, min_12_percentage, min_last_semester_marks
 */

function calculateAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}


function matchProfile(profile = {}, criteria = {}) {
  const c = criteria || {};
  let requiredFail = false;
  let score = 0;

  // Last semester GPA / CGPA
  if (c.gpa_min !== undefined && c.gpa_min !== null) {
    if (
      profile.last_semester_marks === undefined ||
      profile.last_semester_marks === null ||
      Number(profile.last_semester_marks) < Number(c.gpa_min)
    ) {
      requiredFail = true;
    } else {
      score += (Number(profile.last_semester_marks) - Number(c.gpa_min)) * 10;
    }
  }


  // Year
  if (Array.isArray(c.year_in) && c.year_in.length) {
    if (!profile.year_of_study || !c.year_in.includes(profile.year_of_study)) requiredFail = true;
    else score += 5;
  }

  // AGE CHECK
  if (c.age_min !== undefined || c.age_max !== undefined) {
    const age = calculateAge(profile.date_of_birth);

    if (age === null) {
      requiredFail = true;
    }

    if (c.age_min !== undefined && age < Number(c.age_min)) {
      requiredFail = true;
    }

    if (c.age_max !== undefined && age > Number(c.age_max)) {
      requiredFail = true;
    }

    if (!requiredFail) score += 5;
  }

  // Course
  if (Array.isArray(c.course_in) && c.course_in.length) {
    if (!profile.course || !c.course_in.some(x => (profile.course || '').toString().toLowerCase().includes(x.toString().toLowerCase()))) requiredFail = true;
    else score += 10;
  }

  // Income
  if (c.max_income !== undefined && c.max_income !== null) {
    if (profile.income !== undefined && profile.income !== null && Number(profile.income) > Number(c.max_income)) requiredFail = true;
    else score += 5;
  }

  // Caste
  if (Array.isArray(c.caste_in) && c.caste_in.length) {
    if (!profile.caste || !c.caste_in.map(x => x.toString().toLowerCase()).includes((profile.caste || '').toString().toLowerCase())) requiredFail = true;
    else score += 5;
  }

  // Disability
  if (c.disability_required === true) {
    if (!profile.disability) requiredFail = true;
    else score += 5;
  }

  // Country/State
  if (Array.isArray(c.country_in) && c.country_in.length) {
    if (!profile.country || !c.country_in.map(x => x.toString().toLowerCase()).includes((profile.country || '').toString().toLowerCase())) requiredFail = true;
    else score += 3;
  }
  if (Array.isArray(c.state_in) && c.state_in.length) {
    if (!profile.state || !c.state_in.map(x => x.toString().toLowerCase()).includes((profile.state || '').toString().toLowerCase())) requiredFail = true;
    else score += 2;
  }

  // Academic thresholds
  if (c.min_10_percentage !== undefined && c.min_10_percentage !== null) {
    if (!profile.tenth_percentage || Number(profile.tenth_percentage) < Number(c.min_10_percentage)) requiredFail = true;
    else score += (Number(profile.tenth_percentage) - Number(c.min_10_percentage)) * 0.5;
  }
  if (c.min_12_percentage !== undefined && c.min_12_percentage !== null) {
    if (!profile.twelfth_percentage || Number(profile.twelfth_percentage) < Number(c.min_12_percentage)) requiredFail = true;
    else score += (Number(profile.twelfth_percentage) - Number(c.min_12_percentage)) * 0.5;
  }
  if (c.min_last_semester_marks !== undefined && c.min_last_semester_marks !== null) {
    if (!profile.last_semester_marks || Number(profile.last_semester_marks) < Number(c.min_last_semester_marks)) requiredFail = true;
    else score += (Number(profile.last_semester_marks) - Number(c.min_last_semester_marks)) * 0.5;
  }

  return { eligible: !requiredFail, score };
}

module.exports = { matchProfile };
