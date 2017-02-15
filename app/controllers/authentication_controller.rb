class AuthenticationController < ApplicationController
	skip_before_action :authenticate_request

	def authenticate
		command = AuthenticateUser.call(params[:email], params[:password])
		if command.success?
			# return auth token and bookmarks if user authenticates
			user = command.result[0]
	    bookmark_ids = user.bookmarks.pluck(:story_id)
	    bookmarks = Story.where(id: bookmark_ids).select("id, author, title, munged_title, picture").index_by(&:id).slice(*bookmark_ids).values
			render json: { auth_token: command.result[1], bookmarks: bookmarks }
		else
			render json: { error: command.errors }, status: :unauthorized
		end
	end

end