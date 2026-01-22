---
{
  "id": "inv-auth-interpretation",
  "type": "lesson",
  "title": "Authentication Event Interpretation",
  "description": "Understand Windows logon types, failure codes, account types, and authentication protocols to accurately interpret authentication events during investigations.",
  "category": "investigation",
  "bucket": "Security Investigation",
  "keywords": ["authentication", "logon types", "failure codes", "windows", "kerberos"],
  "tags": ["investigation", "authentication", "windows", "intermediate"],
  "difficulty": "intermediate",
  "duration": "15 min",
  "objectives": [
    "Interpret Windows logon types correctly",
    "Decode authentication failure codes",
    "Distinguish account types and their implications",
    "Understand authentication protocol differences"
  ],
  "sortOrder": 204
}
---

## Goal

Correctly interpret authentication events to understand what actually happened. A "failed login" can mean many different things depending on logon type, failure code, and account type.

## Windows Logon Types

Every Windows authentication includes a LogonType field. This reveals HOW the authentication occurred.

| Type | Name | Meaning |
|------|------|---------|
| 2 | Interactive | Keyboard login at console |
| 3 | Network | Access to shared resource (file share, etc.) |
| 4 | Batch | Scheduled task execution |
| 5 | Service | Service starting |
| 7 | Unlock | Workstation unlocked |
| 8 | NetworkCleartext | Network login with cleartext password |
| 9 | NewCredentials | RunAs with /netonly |
| 10 | RemoteInteractive | RDP session |
| 11 | CachedInteractive | Cached credentials (domain unreachable) |

### Investigation Implications

**Type 2 (Interactive)**: Someone physically at the computer or using local console
- Suspicious if: from server that shouldn't have interactive users

**Type 3 (Network)**: Most common - accessing file shares, printers, web apps
- Suspicious if: unexpected lateral movement patterns

**Type 4 (Batch)**: Scheduled tasks
- Suspicious if: new tasks on unexpected systems

**Type 5 (Service)**: Services starting under an account
- Suspicious if: service account logging in interactively elsewhere

**Type 10 (RDP)**: Remote desktop
- Suspicious if: to unexpected systems, from unexpected sources

### Query Pattern

```spl
index=security EventCode=4624
| stats count by Logon_Type, user, dest
| sort - count
```

## Authentication Failure Codes

Failure reason codes (SubStatus or Status fields) explain why authentication failed.

### Common Failure Codes

| Code | Meaning | Investigation Focus |
|------|---------|---------------------|
| 0xC000006A | Bad password | Brute force indicator |
| 0xC000006D | Bad username | Username enumeration |
| 0xC000006E | Account restriction | Policy violation |
| 0xC000006F | Outside logon hours | Time-based restriction |
| 0xC0000070 | Workstation restriction | Location restriction |
| 0xC0000071 | Expired password | Credential hygiene |
| 0xC0000072 | Disabled account | Attempted use of disabled account |
| 0xC000015B | No logon servers | Infrastructure issue |
| 0xC0000192 | Netlogon service not started | Infrastructure issue |
| 0xC0000193 | Expired account | Account lifecycle issue |
| 0xC0000224 | Password change required | Credential hygiene |
| 0xC0000234 | Account locked | Possible brute force |

### Investigation Patterns

**Brute Force Signature**:
```spl
index=security EventCode=4625 SubStatus=0xC000006A
| stats count by user, src_ip
| where count > 10
```

**Username Enumeration Signature**:
```spl
index=security EventCode=4625 SubStatus=0xC000006D
| stats dc(user) as unique_users by src_ip
| where unique_users > 5
```

**Disabled Account Probing**:
```spl
index=security EventCode=4625 SubStatus=0xC0000072
| stats count by user, src_ip
```

## Account Types

Different account types have different risk profiles.

### User vs. Computer Accounts

**User Accounts**: `jsmith`, `admin`
- Represent humans
- Subject to password policies
- Should have predictable behavior patterns

**Computer Accounts**: `WORKSTATION$`, `SERVER01$`
- End with `$`
- Used for machine-to-machine authentication
- Should only authenticate as machines, not interactively

**Suspicious**: Computer account doing interactive login (possible machine account abuse)

### Service Accounts

Accounts used by applications and services:
- `svc_backup`, `sqlsvc`, `app_service`
- Should have predictable, limited behavior
- Should never do interactive logins

**Suspicious Patterns**:
- Service account RDP login
- Service account accessing unusual resources
- Service account from unexpected source

### Privileged Accounts

Administrator accounts require extra scrutiny:
- Domain Admins, Enterprise Admins, Schema Admins
- Local administrators
- Accounts with sensitive group membership

**Query to Find Admin Logins**:
```spl
index=security EventCode=4624
| lookup privileged_accounts user OUTPUT is_admin
| where is_admin=true
| stats count by user, src_ip, Logon_Type
```

### Built-in Accounts

Special Windows accounts:
- `Administrator` - Built-in admin (often disabled)
- `SYSTEM` - Local system
- `NETWORK SERVICE`, `LOCAL SERVICE` - Service contexts
- `ANONYMOUS LOGON` - Unauthenticated

**Suspicious**: Direct Administrator account usage (should use named admin accounts)

## Authentication Protocols

### Kerberos

Modern Windows authentication protocol:
- Ticket-based (TGT, service tickets)
- Stronger security
- Event codes 4768 (TGT request), 4769 (service ticket)

**Kerberos Attack Indicators**:
- Encryption downgrade (RC4 instead of AES)
- Unusual ticket requests
- Service ticket request without prior TGT

### NTLM

Legacy authentication protocol:
- Challenge-response based
- Weaker than Kerberos
- Still widely used for compatibility

**NTLM Usage Query**:
```spl
index=security EventCode=4624 Authentication_Package=NTLM
| stats count by user, src_ip, dest
```

**Suspicious**: NTLM authentication when Kerberos should be available

### Protocol Comparison

| Aspect | Kerberos | NTLM |
|--------|----------|------|
| Security | Stronger | Weaker |
| Ticket-based | Yes | No |
| Mutual auth | Yes | No |
| Pass-the-hash vulnerable | Limited | Yes |

## Reading Authentication Events

### Event 4624 (Success) Key Fields

- **SubjectUserName**: Who requested the logon
- **TargetUserName**: Who logged on
- **LogonType**: How they logged on
- **IpAddress**: Where they came from
- **WorkstationName**: Computer name (may differ from IP)
- **AuthenticationPackageName**: Kerberos or NTLM
- **LogonProcessName**: What initiated logon

### Event 4625 (Failure) Key Fields

- **TargetUserName**: Who tried to log on
- **Status**: Primary failure reason
- **SubStatus**: Detailed failure reason
- **IpAddress**: Source of attempt
- **LogonType**: What type of logon was attempted

### Parsing Example

```spl
index=security EventCode IN (4624, 4625)
| eval outcome = if(EventCode=4624, "success", "failure")
| eval logon_type_name = case(
    Logon_Type=2, "Interactive",
    Logon_Type=3, "Network",
    Logon_Type=10, "RDP",
    true(), Logon_Type)
| table _time, user, src_ip, dest, outcome, logon_type_name
```

## Variations

### Domain Controllers vs. Endpoints

**Domain Controllers**: See all domain authentications
- Higher volume, central visibility
- Kerberos events (4768, 4769)
- Account changes

**Endpoints**: See local authentications
- Interactive logons
- Service account activity
- Local account usage

### Windows vs. Linux/Unix

This lesson focuses on Windows. Linux authentication:
- `/var/log/auth.log` or `/var/log/secure`
- PAM authentication framework
- Different event structure, similar concepts

## Pitfalls

- **Don't ignore logon type** - Type 3 vs Type 10 changes the entire interpretation
- **Don't trust workstation name** - Can be spoofed
- **Don't assume failure = attack** - Most failures are legitimate mistakes
- **Don't ignore ANONYMOUS LOGON** - Often normal for null sessions
- **Don't miss computer accounts** - The `$` suffix matters

## Next Steps

- Apply interpretation skills in Authentication Correlation tutorial
- Practice identifying attack patterns in Brute Force scenario
- Correlate authentication events with process execution
