class AddPictureToStories < ActiveRecord::Migration
  def change
    add_column :stories, :picture, :string
    add_column :stories, :placeholder_picture, :text
  end
end
