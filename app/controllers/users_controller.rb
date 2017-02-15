class UsersController < ApplicationController
	skip_before_action :authenticate_request

	def show
		user = User.find_by(username: params[:id])
		unless user
			return render json: {error: 'User not found'}
		end
    render json: {
    	stories: user.stories.order("created_at DESC").select("id, title, author, munged_title, picture")
    }
	end

	def create
		@user = User.new(user_params)
		if @user.save
			@user.send_activation_email
			render json: { msg: "Account created. Please check email to confirm." }
		else
			render json: { error: @user.errors.full_messages }, status: :unprocessable_entity
		end
	end

	private
		
		def user_params
			params.permit(:username, :email, :password, :password_confirmation)
		end

end