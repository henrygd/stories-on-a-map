class AuthenticateUser
	prepend SimpleCommand

	def initialize(email, password)
		@email =  email
		@password = password
	end

	def call
		if user
			return [user, JsonWebToken.encode(username: user.username)]
		end
	end

	private
		attr_accessor :email, :password

		def user
			user = User.find_by_email(email)
			if user
				if user.authenticate(password) && user.activated?
					return user
				elsif !user.activated?
					errors.add :user_activation, 'Account not yet activated.'
					return nil
				end
			end
			errors.add :user_authentication, 'Invalid credentials'
			nil
		end

end