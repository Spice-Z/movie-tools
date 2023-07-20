 ffmpeg -i ./input/video.mov -vf "subtitles=dist/output.srt:force_style='FontName=M PLUS 1p,FontSize=26,Bold=1'
" dist/out.mov