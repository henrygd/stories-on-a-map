# encoding: utf-8

class PictureUploader < CarrierWave::Uploader::Base
  include CarrierWave::MiniMagick
  process :optimize_header
  # process resize_to_limit: [810, 810]

      if Rails.env.production?
      storage :fog
    else
      storage :file
    end

    # Override the directory where uploaded files will be stored.
    # This is a sensible default for uploaders that are meant to be mounted:
    def store_dir
      "uploads/story_images/#{model.munged_title}"
    end

    # Add a white list of extensions which are allowed to be uploaded.
    def extension_white_list
      %w(jpg jpeg png)
    end

    # Override the filename of the uploaded files:
    # Avoid using model.id or version_name here, see uploader/store.rb for details.
    def filename
      "picture.#{file.extension}" if original_filename
    end

  # version :full do
  #   process :optimize_header
  # end

end
