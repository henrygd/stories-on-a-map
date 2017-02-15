class CreateBookmarks < ActiveRecord::Migration
  def change
    create_table :bookmarks do |t|
      t.integer :user_id
      t.integer :story_id

      t.timestamps null: false
    end
    add_index :bookmarks, :user_id
  end
end
