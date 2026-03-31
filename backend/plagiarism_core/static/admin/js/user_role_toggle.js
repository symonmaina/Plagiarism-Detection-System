document.addEventListener('DOMContentLoaded', async function() {
    const roleSelect = document.querySelector('#id_role');
    const courseSelect = document.querySelector('#id_course');
    const programSelect = document.querySelector('#id_program');
    
    if (!roleSelect) return;
    
    // Store full lists to allow dynamic filtering without losing options
    let courseData = [];
    let allPrograms = Array.from(programSelect?.options || []).map(opt => ({value: opt.value, text: opt.text}));
    let unitMapping = {}; // programId -> [unitIds...]
    
    // Fetch JSON mapping
    try {
        const res = await fetch('/api/admin-api/course-data/');
        courseData = await res.json();
        
        // Build unit mapping for the lecturer filter box
        courseData.forEach(c => {
            c.programs.forEach(p => {
                unitMapping[p.id] = p.units.map(u => u.id.toString());
            });
        });
    } catch (e) {
        console.error("Failed to fetch course data for dynamic admin dropdowns", e);
    }
    
    const fields = {
        student: ['.field-first_name', '.field-last_name', '.field-email', '.field-id_number', '.field-course', '.field-program'],
        lecturer: ['.field-first_name', '.field-last_name', '.field-email', '.field-id_number', '.field-course', '.field-program', '.field-teaching_units'],
        admin: ['.field-username', '.field-password', '.field-confirm_password']
    };
    
    const allFields = new Set([...fields.student, ...fields.lecturer, ...fields.admin]);
    
    function updateRoleFields() {
        const role = roleSelect.value;
        const visibleFields = fields[role] || [];
        
        allFields.forEach(selector => {
            const fieldBox = document.querySelector(selector);
            if (fieldBox) {
                fieldBox.style.display = visibleFields.includes(selector) ? '' : 'none';
            }
        });
        
        const idNumberLabel = document.querySelector('.field-id_number label');
        if (idNumberLabel) {
            idNumberLabel.textContent = role === 'student' ? 'Registration Number:' : 'Staff ID:';
        }
        
        // If switching roles, optionally clear course/program logic
        if (role === 'lecturer') updateUnitFilter();
    }
    
    function updateProgramDropdown() {
        if (!courseSelect || !programSelect) return;
        const selectedCourseId = courseSelect.value;
        
        // Clear program options (keep empty option)
        programSelect.innerHTML = '<option value="" selected>---------</option>';
        
        if (!selectedCourseId) {
            // Restore all if no course selected
            allPrograms.forEach(opt => {
                if(opt.value) programSelect.add(new Option(opt.text, opt.value));
            });
        } else {
            // Filter by selected course
            const courseObj = courseData.find(c => c.id.toString() === selectedCourseId);
            if (courseObj) {
                courseObj.programs.forEach(p => {
                    programSelect.add(new Option(p.name, p.id));
                });
            }
        }
        updateUnitFilter();
    }

    // Filter the Django's built-in filter_horizontal left selectbox (`#id_teaching_units_from`)
    function updateUnitFilter() {
        const role = roleSelect.value;
        if (role !== 'lecturer') return;
        
        const teachingUnitsFrom = document.querySelector('#id_teaching_units_from');
        if (!teachingUnitsFrom) return;
        
        const selectedProgramId = programSelect ? programSelect.value : null;
        
        // Loop over left side options, show/hide based on mapping.
        // Django's admin JS moves selected ones to `#id_teaching_units_to`, so we don't mess with that side!
        Array.from(teachingUnitsFrom.options).forEach(opt => {
            if (!selectedProgramId) {
                // If no program selected, show all units
                opt.style.display = '';
            } else {
                const programUnits = unitMapping[selectedProgramId] || [];
                if (programUnits.includes(opt.value)) {
                    opt.style.display = '';
                } else {
                    opt.style.display = 'none';
                }
            }
        });
    }
    
    roleSelect.addEventListener('change', updateRoleFields);
    if (courseSelect) courseSelect.addEventListener('change', updateProgramDropdown);
    if (programSelect) programSelect.addEventListener('change', updateUnitFilter);
    
    updateRoleFields(); // Run on init
    
    // Add a small delay for filter horizontal as django inits it dynamically
    setTimeout(() => {
        if(roleSelect.value === 'lecturer') updateUnitFilter();
    }, 500);
});
