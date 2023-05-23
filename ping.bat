@echo off
ping %1 -n 1 > nul
if errorlevel 1 (
    echo error
) else (
    echo success
)
