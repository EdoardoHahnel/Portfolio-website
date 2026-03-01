# E-postnotifiering – Modelleringsmaterial

När någon fyller i e-postadress i "Få gratis modelleringsmaterial" på forumet kan du få ett mejl.

## Miljövariabler

Sätt följande i din miljö (t.ex. `.env` eller hosting-panelen):

| Variabel | Beskrivning | Exempel |
|----------|-------------|---------|
| `MODELLING_REQUEST_EMAIL` | Din e-postadress som ska få notiser | `din@email.se` |
| `MAIL_SERVER` | SMTP-server | `smtp.gmail.com` |
| `MAIL_PORT` | Port (ofta 587 för TLS) | `587` |
| `MAIL_USERNAME` | SMTP-användarnamn | `din@gmail.com` |
| `MAIL_PASSWORD` | SMTP-lösenord eller app-lösenord | `xxxx xxxx xxxx xxxx` |
| `MAIL_USE_TLS` | Använd TLS | `true` |
| `MAIL_DEFAULT_SENDER` | Avsändaradress (valfritt) | `noreply@portfoljbolagen.se` |

## Gmail

1. Aktivera 2-stegsverifiering i ditt Google-konto
2. Skapa ett "App-lösenord" under Säkerhet → App-lösenord
3. Använd app-lösenordet som `MAIL_PASSWORD`

## Alternativ

Signups sparas alltid i databasen och visas i Forum Admin (`/forum/admin`) under "Modelleringsmaterial – e-postsignup", även om mejl inte skickas.
