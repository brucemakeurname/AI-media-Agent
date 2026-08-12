#!/bin/bash
# Assembly test: assembled_broll.mp4 + all A-roll MOV overlays
# Actual A-roll timestamps in assembled_broll.mp4 (based on zoomed segment durations):
#   ar_00: start=0.000  dur=3.924s  cluster=4.103s
#   ar_01: start=9.273  dur=3.845s  cluster=4.036s
#   ar_02: start=21.217 dur=4.644s  cluster=4.877s
#   ar_03: start=34.874 dur=3.061s  cluster=3.210s
#   ar_05: start=48.366 dur=5.261s  cluster=5.591s
#   ar_06: start=59.305 dur=3.400s  cluster=3.569s

BASE="D:/1. SOLOFLOWS/5. INFRASTRUCTURE/INHOUSE TEAMS/2. Media Team/5. Video Hub/top-heading-editing/Test/proj_teleprompter_01"
BROLL="$BASE/output/assembled_broll.mp4"
AR="$BASE/aroll_renders"
OUT="$BASE/output/test_aroll_assembly.mp4"

ffmpeg -y \
  -i "$BROLL" \
  -i "$AR/ar_00.mov" \
  -i "$AR/ar_01.mov" \
  -i "$AR/ar_02.mov" \
  -i "$AR/ar_03.mov" \
  -i "$AR/ar_05.mov" \
  -i "$AR/ar_06.mov" \
  -filter_complex "
    [1:v]setpts=PTS+0.000/TB[ov0];
    [2:v]setpts=PTS+9.273/TB[ov1];
    [3:v]setpts=PTS+21.217/TB[ov2];
    [4:v]setpts=PTS+34.874/TB[ov3];
    [5:v]setpts=PTS+48.366/TB[ov4];
    [6:v]setpts=PTS+59.305/TB[ov5];
    [0:v][ov0]overlay=0:0:eof_action=pass[v1];
    [v1][ov1]overlay=0:0:eof_action=pass[v2];
    [v2][ov2]overlay=0:0:eof_action=pass[v3];
    [v3][ov3]overlay=0:0:eof_action=pass[v4];
    [v4][ov4]overlay=0:0:eof_action=pass[v5];
    [v5][ov5]overlay=0:0:eof_action=pass[out]
  " \
  -map "[out]" -map 0:a \
  -c:v libx264 -crf 18 -preset medium \
  -c:a copy \
  -movflags +faststart \
  "$OUT"

echo "Done: $OUT"
ffprobe -v quiet -show_entries format=duration,size -of default=noprint_wrappers=1 "$OUT" 2>/dev/null
