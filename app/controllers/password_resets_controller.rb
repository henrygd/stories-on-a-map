class PasswordResetsController < ApplicationController
  skip_before_action :authenticate_request

  def create
    @user = User.find_by(email: params[:email].downcase)
    if @user
      @user.create_reset_digest
      @user.send_password_reset_email
      render json: {msg: "Email sent with password reset instructions. Please check spam folder if it doesn't arrive as normal."}
    else
      render json: {error: ['User not found']}
    end
  end

  def update
    user = User.find_by(email: params[:email])
    # Confirms a valid user.
    unless (user && user.activated? &&
            user.authenticated?(:reset, params[:reset_token]))
      return render json: {error: ["Link is not valid. Please request a new link."]}
    end
    # check link expiration
    if user.password_reset_expired?
      return render json: {error: ["Link has expired. Please request a new link."]}
    end
    if params[:password].empty?
      return render json: {error: ["Please enter a password"]}
    elsif user.update_attributes(user_params)
      # log in user
      command = AuthenticateUser.call(params[:email], params[:password])
      if command.success?
        # return auth token and bookmarks if user authenticates
        user = command.result[0]
        bookmark_ids = user.bookmarks.pluck(:story_id)
        bookmarks = Story.where(id: bookmark_ids).select("id, author, title, munged_title, picture").index_by(&:id).slice(*bookmark_ids).values
        render json: { msg: 'Password reset successfully!', auth_token: command.result[1], bookmarks: bookmarks }
      else
        render json: { error: command.errors }, status: :unauthorized
      end
    else
      render json: {error: ['Error authenticating user']}
    end
  end

  private

    def user_params
      params.permit(:password, :reset_token)
    end

    # Before filters

    # Confirms a valid user.
    # def valid_user
    #   unless (user && user.activated? &&
    #           user.authenticated?(:reset, params[:id]))
    #     render json: {error: ["Link is not valid. Request new link below."]}
    #   end
    # end

    # Checks expiration of reset token.
    # def check_expiration
    #   if user.password_reset_expired?
    #     flash[:notice] = "Link expired. Request new link below."
    #     redirect_to new_password_reset_url
    #   end
    # end
end