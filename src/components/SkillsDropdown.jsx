import { useState, useEffect } from 'react';

const SkillsDropdown = ({ selectedSkills, onSkillsChange, maxSkills = 5 }) => {
  const [availableSkills, setAvailableSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch skills from API or use static data
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        // Try to fetch from API first
        const response = await fetch('/api/skills');
        if (response.ok) {
          const skillsData = await response.json();
          setAvailableSkills(skillsData.skills || skillsData);
        } else {
          // Fallback to static skills data
          const staticSkills = [
            { id: 1, name: "JavaScript", category: "Programming Language" },
            { id: 2, name: "React", category: "Frontend Framework" },
            { id: 3, name: "Node.js", category: "Backend Technology" },
            { id: 4, name: "Python", category: "Programming Language" },
            { id: 5, name: "Java", category: "Programming Language" },
            { id: 6, name: "SQL", category: "Database" }
          ];
          setAvailableSkills(staticSkills);
        }
      } catch (error) {
        console.error('Failed to fetch skills:', error);
        // Fallback to static skills data
        const staticSkills = [
          { id: 1, name: "JavaScript", category: "Programming Language" },
          { id: 2, name: "React", category: "Frontend Framework" },
          { id: 3, name: "Node.js", category: "Backend Technology" },
          { id: 4, name: "Python", category: "Programming Language" },
          { id: 5, name: "Java", category: "Programming Language" },
          { id: 6, name: "SQL", category: "Database" }
        ];
        setAvailableSkills(staticSkills);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const handleSkillToggle = (skill) => {
    const isSelected = selectedSkills.some(s => s.id === skill.id);
    
    if (isSelected) {
      // Remove skill
      const updatedSkills = selectedSkills.filter(s => s.id !== skill.id);
      onSkillsChange(updatedSkills);
    } else {
      // Add skill (if under limit)
      if (selectedSkills.length < maxSkills) {
        const updatedSkills = [...selectedSkills, skill];
        onSkillsChange(updatedSkills);
      }
    }
  };

  const removeSkill = (skillId) => {
    const updatedSkills = selectedSkills.filter(s => s.id !== skillId);
    onSkillsChange(updatedSkills);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Skills</label>
        <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Skills (Select up to {maxSkills})
      </label>
      
      {/* Selected Skills Display */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((skill) => (
            <span
              key={skill.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {skill.name}
              <button
                type="button"
                onClick={() => removeSkill(skill.id)}
                className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-indigo-200 focus:outline-none focus:bg-indigo-200"
              >
                <span className="sr-only">Remove {skill.name}</span>
                <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Skills Selection Dropdown */}
      <div className="relative">
        <select
          onChange={(e) => {
            if (e.target.value) {
              const skill = availableSkills.find(s => s.id === parseInt(e.target.value));
              if (skill) {
                handleSkillToggle(skill);
                e.target.value = ''; // Reset dropdown
              }
            }
          }}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          disabled={selectedSkills.length >= maxSkills}
        >
          <option value="">
            {selectedSkills.length >= maxSkills 
              ? `Maximum ${maxSkills} skills selected` 
              : 'Add a skill...'
            }
          </option>
          {availableSkills
            .filter(skill => !selectedSkills.some(s => s.id === skill.id))
            .map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name} ({skill.category})
              </option>
            ))}
        </select>
      </div>

      {/* Skills count indicator */}
      <p className="text-xs text-gray-500">
        {selectedSkills.length} of {maxSkills} skills selected
      </p>
    </div>
  );
};

export default SkillsDropdown;