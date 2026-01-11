document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const rollNumber = document.getElementById('roll-number').value.trim();
  const loginBtn = document.getElementById('login-btn');
  const loading = document.getElementById('loading');
  const errorMsg = document.getElementById('error-msg');

  // Hide error
  errorMsg.classList.remove('show');

  // Show loading
  loginBtn.disabled = true;
  loading.classList.add('show');

  try {
    // Query Supabase for student
    const students = await supabaseQuery('students', { roll_number: rollNumber });

    if (students && students.length > 0) {
      const student = students[0];

      // Save to Chrome storage
      await chrome.storage.sync.set({
        logged_in: true,
        roll_number: student.roll_number,
        student_name: student.name,
        disability_type: student.disability_type
      });

      console.log('✅ Login successful:', student.name);

      // Show success
      loginBtn.textContent = '✅ Login Successful!';
      loginBtn.style.background = '#22c55e';

      // Send message to popup to refresh
      chrome.runtime.sendMessage({ 
        action: 'login_success',
        student: {
          name: student.name,
          roll_number: student.roll_number,
          disability_type: student.disability_type
        }
      });

      // Close login window after short delay
      setTimeout(() => {
        window.close();
      }, 800);

    } else {
      // Student not found
      throw new Error('Student not found');
    }

  } catch (error) {
    console.error('Login error:', error);
    errorMsg.textContent = 'Roll number not found. Please check and try again.';
    errorMsg.classList.add('show');
    loginBtn.disabled = false;
    loading.classList.remove('show');
  }
});
