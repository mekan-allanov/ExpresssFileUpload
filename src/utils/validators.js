export const isValidEmail = email => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export const isValidPassword = password => {
	// Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
	return passwordRegex.test(password);
};

export const isValidUsername = username => {
	// Username must be 3-30 characters long and can only contain letters, numbers, and underscores
	const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
	return usernameRegex.test(username);
};
