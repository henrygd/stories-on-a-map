class AddMungedTitleToStories < ActiveRecord::Migration
  def change
    add_column :stories, :munged_title, :string
  end
end
