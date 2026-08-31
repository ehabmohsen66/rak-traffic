module.exports=[86599,e=>{"use strict";let t="https://rak4dev.com";function i(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function o({preheader:e,badgeText:t="RAK Traffic",headline:r,accentColor:a="#4f46e5",contentHtml:n,taskUrl:l,ctaText:s="View Task in RAK Traffic",footerNote:d}){return`<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>RAK Traffic</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #0f172a;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      outline: none;
      text-decoration: none;
      display: block;
    }
    @media only screen and (max-width: 600px) {
      .container-table { width: 100% !important; border-radius: 0 !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc;">
  <!-- Hidden Preheader -->
  <div style="display:none;font-size:1px;color:#f8fafc;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${i(e)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc; width:100%; min-height:100vh;">
    <tr>
      <td align="center" style="padding: 32px 12px;">
        
        <!-- Main Email Card -->
        <table role="presentation" class="container-table" width="580" cellpadding="0" cellspacing="0" border="0" style="width:580px; max-width:580px; background-color:#ffffff; border-radius:16px; overflow:hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);">
          
          <!-- Sleek Header -->
          <tr>
            <td style="padding: 22px 28px; background-color: #0f172a;" class="mobile-padding">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <span style="font-size: 19px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">RAK</span>
                    <span style="font-size: 13px; font-weight: 800; color: #818cf8; letter-spacing: 1.5px; margin-left: 6px; text-transform: uppercase;">TRAFFIC</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #cbd5e1; letter-spacing: 0.3px;">
                      ${i(t)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${r?`
          <!-- Headline Banner -->
          <tr>
            <td style="background-color: ${a}; padding: 14px 28px; color: #ffffff;" class="mobile-padding">
              <div style="font-size: 15px; font-weight: 800; color: #ffffff; letter-spacing: 0.2px;">
                ${i(r)}
              </div>
            </td>
          </tr>
          `:""}

          <!-- Body Content -->
          <tr>
            <td style="padding: 28px 28px 32px 28px;" class="mobile-padding">
              ${n}

              <!-- Action Button -->
              ${l?`
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="border-radius: 10px; background-color: #4f46e5;">
                          <a href="${l}" target="_blank" style="display: inline-block; padding: 13px 26px; font-size: 13px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 10px; letter-spacing: 0.2px;">
                            ${i(s)} &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              `:""}
            </td>
          </tr>

          <!-- Clean Minimalist Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 28px; border-top: 1px solid #f1f5f9; text-align: center;" class="mobile-padding">
              <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: #64748b;">
                RAK Traffic • Agency Workflow Platform
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                ${d||"Automated operational notification. You received this because you are part of this task assignment."}
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`}var r=e.i(40317);let a={provider:"vercel",fromName:"RAK 4 CREATIVE Traffic",fromEmail:"onboarding@resend.dev",replyTo:"farah@rak4cloud.com",enableAssignmentEmails:!0,enableDailyReminders:!0};async function n(e,t=a){let i,o=process.env.EMAIL_FROM_NAME||e.from?.name||t.fromName||"RAK 4 CREATIVE Traffic",l=process.env.EMAIL_FROM||e.from?.email||t.fromEmail||"onboarding@resend.dev",s=`eml-${Date.now()}-${Math.random().toString(36).substring(2,6)}`,d=new Date().toISOString(),p="simulated",c=process.env.EMAIL_PROVIDER||"simulated",f=("vercel"===c||"resend"===c?process.env.RESEND_API_KEY:"")||("sendgrid"===c?process.env.SENDGRID_API_KEY:"")||("brevo"===c?process.env.BREVO_API_KEY:"")||void 0,m=process.env.EMAIL_WEBHOOK_URL||void 0,g=process.env.EMAIL_REPLY_TO||t.replyTo||l;try{if("simulated"!==c){let t=(process.env.EMAIL_ALLOWED_DOMAINS||"").split(",").map(e=>e.trim().toLowerCase()).filter(Boolean),i=e.to.email.split("@").pop()?.toLowerCase();if(0===t.length)throw Error("Live email delivery is disabled until EMAIL_ALLOWED_DOMAINS is configured on the server.");if(!i||!t.includes("*")&&!t.includes(i))throw Error(`Email delivery to @${i||"unknown"} is not allowed by the server configuration.`)}switch(c){case"vercel":case"resend":{if(!f)throw Error("Resend is not configured on the server. Add RESEND_API_KEY to the cPanel Node.js environment.");let t=l.includes("@")?l:"onboarding@resend.dev",i=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${f}`},body:JSON.stringify({from:`${o} <${t}>`,to:[e.to.email],subject:e.subject,html:e.html,text:e.text,reply_to:g})}),r=await i.json().catch(()=>({}));if(!i.ok){let e=r.message||`Resend error: ${i.statusText}`;if(e.includes("only send testing emails")||e.includes("testing emails"))throw Error(`${e} (Tip: When using onboarding@resend.dev, send test emails to your registered Resend account email: ehabmohsen66@gmail.com, or verify a custom domain to send to any team email).`);throw Error(e)}p="delivered";break}case"sendgrid":{if(!f)throw Error("SendGrid API key is missing. Please set your API Key in Settings or SENDGRID_API_KEY in .env.");let t=await fetch("https://api.sendgrid.com/v3/mail/send",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${f}`},body:JSON.stringify({personalizations:[{to:[{email:e.to.email,name:e.to.name}]}],from:{email:l,name:o},reply_to:{email:g},subject:e.subject,content:[{type:"text/plain",value:e.text},{type:"text/html",value:e.html}]})});if(!t.ok){let e=await t.json().catch(()=>({}));throw Error(e?.errors?.[0]?.message||`SendGrid error: ${t.statusText}`)}p="delivered";break}case"brevo":{if(!f)throw Error("Brevo API key is missing. Please set your API Key in Settings or BREVO_API_KEY in .env.");let t=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"Content-Type":"application/json","api-key":f},body:JSON.stringify({sender:{name:o,email:l},to:[{name:e.to.name,email:e.to.email}],replyTo:{email:g},subject:e.subject,htmlContent:e.html,textContent:e.text})});if(!t.ok){let e=await t.json().catch(()=>({}));throw Error(e?.message||`Brevo error: ${t.statusText}`)}p="delivered";break}case"webhook":{if(!m)throw Error("Custom Webhook URL is not configured in Settings or EMAIL_WEBHOOK_URL in .env.");let t=await fetch(m,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event:"traffic_email_dispatch",type:e.type,recipient:e.to,sender:{name:o,email:l},subject:e.subject,html:e.html,text:e.text,taskId:e.taskId,taskTitle:e.taskTitle,timestamp:d})});if(!t.ok)throw Error(`Webhook error: ${t.statusText}`);p="delivered";break}default:console.log(`[SIMULATED EMAIL DISPATCH] To: ${e.to.name} <${e.to.email}> | Subject: "${e.subject}" | Type: ${e.type}`),p="simulated"}}catch(e){console.error("Email dispatch failed:",e),p="failed",i=(0,r.getErrorMessage)(e,"Failed to dispatch email")}let b={id:s,taskId:e.taskId,taskTitle:e.taskTitle,recipientId:e.to.id||"usr-custom",recipientName:e.to.name,recipientEmail:e.to.email,senderName:o,senderEmail:l,subject:e.subject,type:e.type,htmlBody:e.html,textBody:e.text,sentAt:d,status:p,provider:c,errorMessage:i};return{success:"failed"!==p,log:b,error:i}}async function l(e,r){let{subject:a,html:l,text:s}=function(e){let{task:r,assignee:a,assigner:n,client:l,baseUrl:s=t}=e,d=`${s}/?task=${r.id}`,p=function(e){switch(e){case"Super Urgent":case"Urgent":return{bg:"#fef2f2",text:"#dc2626",border:"#fecaca",label:"🔥 URGENT"};case"High":return{bg:"#fffbeb",text:"#d97706",border:"#fde68a",label:"⚡ HIGH"};default:return{bg:"#f1f5f9",text:"#475569",border:"#e2e8f0",label:"NORMAL"}}}(r.priority),c=a?.name||"Team Member",f=n?.name||"Management",m=`[Due Today] ${r.title} - ${l?.name||"Client"}`,g=`Hi @${c}, reminder that "${r.title}" is due today.`,b=`
    <!-- Personal Greeting -->
    <div style="font-size: 15px; color: #0f172a; margin-bottom: 18px; line-height: 1.5;">
      Hi <strong style="color: #d97706;">@${i(c)}</strong>,<br>
      <span style="color: #475569;">Friendly reminder that the following task is scheduled for completion <strong>today</strong>:</span>
    </div>

    <!-- Task Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
      <tr>
        <td style="padding: 18px 20px;">
          <div style="margin-bottom: 8px;">
            <span style="display:inline-block; background-color:${p.bg}; color:${p.text}; border:1px solid ${p.border}; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:800;">
              ${p.label}
            </span>
            <span style="display:inline-block; background-color:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:800; margin-left:6px;">
              DUE TODAY
            </span>
          </div>

          <div style="font-size: 17px; font-weight: 800; color: #78350f; line-height: 1.35; margin-bottom: 12px;">
            ${i(r.title)}
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #fef3c7; padding-top: 10px;">
            <tr>
              <td width="50%">
                <div style="font-size: 11px; font-weight: 700; color: #b45309; text-transform: uppercase;">Client</div>
                <div style="font-size: 13px; font-weight: 700; color: #78350f; margin-top: 2px;">${i(l?.name||"Client")}</div>
              </td>
              <td width="50%">
                <div style="font-size: 11px; font-weight: 700; color: #b45309; text-transform: uppercase;">Manager</div>
                <div style="font-size: 13px; font-weight: 700; color: #78350f; margin-top: 2px;">${i(f)}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${r.notes?`
    <div style="margin-bottom: 18px;">
      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">
        Brief Notes
      </div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #475569; line-height: 1.5;">
        ${i(r.notes)}
      </div>
    </div>
    `:""}

    <div style="font-size: 13px; color: #64748b; text-align: center;">
      Please submit your deliverables and mark the task as <strong>Completed</strong> in RAK Traffic once done.
    </div>
  `,h=`
Hi @${c},

Reminder: The following task is due TODAY:
Task: ${r.title}
Client: ${l?.name||"Client"}
Due Date: ${r.dueDate} (Today)
Priority: ${r.priority}

Open & Complete in RAK Traffic: ${d}
`;return{subject:m,html:o({preheader:g,badgeText:"Deadline Today",headline:"Task Due Today",accentColor:"#d97706",contentHtml:b,taskUrl:d,ctaText:"Review & Complete Task"}),text:h}}(e);return n({to:{id:e.assignee.id,name:e.assignee.name,email:e.assignee.email},subject:a,html:l,text:s,type:"due_today",taskId:e.task.id,taskTitle:e.task.title},r)}async function s(e,r){let{subject:a,html:l,text:s}=function(e){let{task:r,assignee:a,assigner:n,client:l,baseUrl:s=t,daysOverdue:d=1}=e,p=`${s}/?task=${r.id}`,c=a?.name||"Team Member",f=n?.name||"Management",m=`[Overdue] ${r.title} (${d}d late) - ${l?.name||"Client"}`,g=`Hi @${c}, task "${r.title}" is ${d} days overdue. Please update.`,b=`
    <!-- Personal Greeting -->
    <div style="font-size: 15px; color: #0f172a; margin-bottom: 18px; line-height: 1.5;">
      Hi <strong style="color: #e11d48;">@${i(c)}</strong>,<br>
      <span style="color: #475569;">This is a daily reminder regarding an overdue task. The deadline passed <strong>${d} day${d>1?"s":""} ago (${function(e){try{return new Date(e).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})}catch{return e}}(r.dueDate)})</strong>:</span>
    </div>

    <!-- Overdue Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
      <tr>
        <td style="padding: 18px 20px;">
          <div style="margin-bottom: 8px;">
            <span style="display:inline-block; background-color:#e11d48; color:#ffffff; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:800;">
              ⚠️ ${d} DAYS OVERDUE
            </span>
          </div>

          <div style="font-size: 17px; font-weight: 800; color: #881337; line-height: 1.35; margin-bottom: 12px;">
            ${i(r.title)}
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #fecdd3; padding-top: 10px;">
            <tr>
              <td width="50%">
                <div style="font-size: 11px; font-weight: 700; color: #9f1239; text-transform: uppercase;">Client</div>
                <div style="font-size: 13px; font-weight: 700; color: #4c0519; margin-top: 2px;">${i(l?.name||"Client")}</div>
              </td>
              <td width="50%">
                <div style="font-size: 11px; font-weight: 700; color: #9f1239; text-transform: uppercase;">Manager</div>
                <div style="font-size: 13px; font-weight: 700; color: #4c0519; margin-top: 2px;">${i(f)}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${r.notes?`
    <div style="margin-bottom: 18px;">
      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">
        Scope & Notes
      </div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #475569; line-height: 1.5;">
        ${i(r.notes)}
      </div>
    </div>
    `:""}
  `,h=`
Hi @${c},

Task Overdue Reminder:
Task: ${r.title} (${d} days late)
Client: ${l?.name||"Client"}
Due Date: ${r.dueDate}
Manager: ${f}

Update in RAK Traffic: ${p}
`;return{subject:m,html:o({preheader:g,badgeText:"Action Required",headline:`Overdue Task (${d}d late)`,accentColor:"#e11d48",contentHtml:b,taskUrl:p,ctaText:"Update Task Status"}),text:h}}(e);return n({to:{id:e.assignee.id,name:e.assignee.name,email:e.assignee.email},subject:a,html:l,text:s,type:"overdue",taskId:e.task.id,taskTitle:e.task.title},r)}async function d(e,r){let{subject:a,html:l,text:s}=function(e){let{recipientName:r,recipientEmail:a,baseUrl:n=t}=e,l=`Hi @${r}, email dispatch connection is verified and operational.`,s=`
    <!-- Personal Greeting -->
    <div style="font-size: 15px; color: #0f172a; margin-bottom: 18px; line-height: 1.5;">
      Hi <strong style="color: #4f46e5;">@${i(r)}</strong>,<br>
      <span style="color: #475569;">Your RAK Traffic notifications are active. You will receive real-time updates here whenever tasks are assigned, updated, or completed.</span>
    </div>

    <!-- Info Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
      <tr>
        <td style="padding: 18px 20px;">
          <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
            Notification Preferences
          </div>
          <div style="font-size: 12px; color: #64748b; line-height: 1.6;">
            • Recipient: <strong style="color:#1e293b;">${i(a)}</strong><br>
            • Task Assignments & Due Dates: Active<br>
            • Daily Morning Reminders: Active
          </div>
        </td>
      </tr>
    </table>
  `,d=`
Hi @${r},

Your email notification setup is verified and active!
Recipient: ${a}
Time: ${new Date().toISOString()}

RAK Traffic Hub
`;return{subject:"[RAK Traffic] Connection Verified",html:o({preheader:l,badgeText:"Connection Verified",headline:"Email Engine Online",accentColor:"#4f46e5",contentHtml:s,taskUrl:n,ctaText:"Open RAK Traffic"}),text:d}}(e);return n({to:{name:e.recipientName,email:e.recipientEmail},subject:a,html:l,text:s,type:"test"},r)}e.s(["DEFAULT_EMAIL_CONFIG",0,a,"sendDueTodayNotification",0,l,"sendEmail",0,n,"sendOverdueDailyNotification",0,s,"sendTestNotification",0,d],86599)}];

//# sourceMappingURL=src_lib_emailService_ts_0p1_zu8._.js.map