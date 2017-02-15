class StoriesController < ApplicationController
	skip_before_action :authenticate_request, only: [:index, :show]

	def index
		# byebug
		stories =  Story.all.pluck(:id, :author, :title, :munged_title, :coords)
		# if user sends auth token, return stories and bookmarks in one request
		if request.headers['Authorization'].present?
			user = AuthorizeApiRequest.call(request.headers).result
			if user
		    bookmark_ids = user.bookmarks.pluck(:story_id)
		    bookmarks = Story.where(id: bookmark_ids).select("id, author, title, munged_title, picture").index_by(&:id).slice(*bookmark_ids).values
		    return render json: {
		      stories: stories,
		      bookmarks: bookmarks
		    }
			end
		end
		# return only stories if no valid auth token
		render json: {stories: stories}
	end

	def show
		story = Story.find_by(munged_title: params[:id])
		story ||= {error: 'Story not found'}
		render json: story
	end

	def create
		story = current_user.stories.build(story_params)
		story.save
		if story.errors.any?
			return render json: {error: story.errors.full_messages}
		end
		render json: {newStory: [story.id, story.author, story.title, story.munged_title, story.coords]};
	end

	def destroy
		story = Story.find_by(id: params[:story_id])
		if (current_user.admin? || current_user.id === story.user_id) && story.destroy
				render json: current_user.stories.order("created_at DESC").select("id, title, author, munged_title, picture")
		else
			render json: { error: 'Not authorized' }, status: :unauthorized
		end
	end

	private

		def story_params
			params.permit(:coords, :title, :author, :content, :picture, :background, :audio)
		end

end