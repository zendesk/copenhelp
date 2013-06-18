namespace :deploy do
  task :s3 do
    if `which s3cmd`.chomp.empty?
      puts 'please install and configure s3cmd'
    end
    deploy_files = %w(
      index.html
      admin.html
      images/spinner.gif
      js/vendor/parse-1.2.2.min.js
      js/static/output.js
      js/static/admin.js
      css/vendor/bootstrap.min.css
      css/vendor/normalize.min.css
      css/static/user.css
      css/static/admin.css
    )
    deploy_files.each do |d|
      system("s3cmd put --acl-public #{d} s3://link-sf.com/#{d}")
    end
  end

  task :parse do
    system("cd #{File.dirname(__FILE__) + '/server'} && parse deploy")
  end

end

task :grunt do
  abort unless system("grunt")
end

task :deploy => ['grunt', 'deploy:parse', 'deploy:s3']
