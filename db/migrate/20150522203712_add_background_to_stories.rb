class AddBackgroundToStories < ActiveRecord::Migration
  def change
    add_column :stories, :background, :string
    add_column :stories, :placeholder_background, :text
  end
end
