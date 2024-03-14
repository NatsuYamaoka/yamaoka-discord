@echo off
setlocal

rem Test without --swc flag
echo Calling without --swc flag
set start_time=%TIME%
call ts-node -r tsconfig-paths/register src/index.ts >NUL
set end_time=%TIME%

call :CalculateElapsedTime %start_time% %end_time%
set first_command_elapsed_time=%elapsed_milliseconds%
echo Without --swc flag: %elapsed_milliseconds% milliseconds


rem Test with --swc flag
echo Calling with --swc flag
set start_time=%TIME%
call ts-node --swc -r tsconfig-paths/register src/index.ts >NUL
set end_time=%TIME%

call :CalculateElapsedTime %start_time% %end_time%
set second_command_elapsed_time=%elapsed_milliseconds%
echo With --swc flag: %elapsed_milliseconds% milliseconds
exit /b

:CalculateElapsedTime
for /f "tokens=1-4 delims=:.," %%a in ("%1") do (
    set /a "start_milliseconds=360000*1%%a+60000*1%%b+1000*1%%c+1%%d"
)
for /f "tokens=1-4 delims=:.," %%a in ("%2") do (
    set /a "end_milliseconds=360000*1%%a+60000*1%%b+1000*1%%c+1%%d"
)
set /a "elapsed_milliseconds=end_milliseconds-start_milliseconds"
exit /b
