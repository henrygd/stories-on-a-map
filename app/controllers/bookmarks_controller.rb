class BookmarksController < ApplicationController
  # before_action :must_login, only: [:create, :destroy, :show]

  # Return json index of user bookmarked story ids
  def index
    bookmark_ids = current_user.bookmarks.pluck(:story_id)
    bookmarks = Story.where(id: bookmark_ids).select("id, author, title, munged_title, picture").index_by(&:id).slice(*bookmark_ids).values
    render json: bookmarks
  end

  def create
    bookmark = current_user.bookmarks.build(story_id: params[:story_id])
    if !!bookmark && bookmark.save
      render json: {success: true}
    else
      render json: {error: 'Error creating bookmark'}
    end
  end

  def destroy
    bookmark = current_user.bookmarks.find_by(story_id: params[:story_id])
    if !!bookmark && bookmark.delete
      render json: {success: true}
    else
      render json: {error: 'Error deleting bookmark'}
    end
  end

end