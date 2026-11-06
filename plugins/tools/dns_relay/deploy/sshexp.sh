#!/bin/bash
# usage: sshexp.sh "<remote command>"
export SSHPASS='Z$2mK^APUc5W32p'
/usr/bin/expect -f - <<'EOF'
set timeout 120
set cmd [lindex $argv 0]
log_user 1
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o PreferredAuthentications=password -o PubkeyAuthentication=no -o NumberOfPasswordPrompts=1 root@119.29.111.31 $cmd
expect {
    -re {[Pp]assword:} { send {Z$2mK^APUc5W32p}
        exp_continue
    }
    "Permission denied" { exit 2 }
    eof
}
catch wait result
exit [lindex $result 3]
EOF
