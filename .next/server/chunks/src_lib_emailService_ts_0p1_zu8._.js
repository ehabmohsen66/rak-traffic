module.exports=[86599,40317,e=>{"use strict";let t="http://localhost:3000";function i(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function o(e){try{return new Date(e).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})}catch{return e}}function r({preheader:e,headerBanner:t,contentHtml:o,taskUrl:a,ctaText:n="Open Task in Traffic Hub",footerNote:s}){return`<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>RAK 4 CREATIVE - Traffic Hub Notification</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #1e293b;
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
      .container-table { width: 100% !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-hide { display: none !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9;">
  <!-- Hidden Preheader -->
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${i(e)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9; width:100%; min-height:100vh;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <!-- Email Container -->
        <table role="presentation" class="container-table" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Top Lebanese Creative Accent Bar -->
          <tr>
            <td style="height: 5px; background: linear-gradient(90deg, #dc2626 0%, #4f46e5 50%, #059669 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 24px 28px; background-color: #0f172a;" class="mobile-padding">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <div style="display:flex; align-items:baseline;">
                      <span style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">R</span><span style="font-size: 24px; font-weight: 900; color: #6366f1;">A</span><span style="font-size: 24px; font-weight: 900; color: #ffffff;">K</span>
                      <span style="font-size: 13px; font-weight: 800; color: #818cf8; margin-left: 6px; text-transform: uppercase; letter-spacing: 2px;">4 CREATIVE</span>
                    </div>
                    <div style="font-size: 11px; font-weight: 600; color: #94a3b8; margin-top: 3px; letter-spacing: 0.5px;">
                      Traffic & Workflow Hub • Beirut HQ 🇱🇧
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; background-color: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.35); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.5px;">
                      Agency Dispatch
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Banner / Alert Header (Optional) -->
          ${t||""}

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px 28px;" class="mobile-padding">
              ${o}

              <!-- Primary CTA Button -->
              ${a?`
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 28px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                          <a href="${a}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px; letter-spacing: 0.2px;">
                            ${i(n)} &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <span style="font-size: 11px; color: #94a3b8;">Click button to jump directly to this task in the workspace.</span>
                  </td>
                </tr>
              </table>
              `:""}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 28px; border-top: 1px solid #e2e8f0; text-align: center;" class="mobile-padding">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #475569;">
                RAK 4 CREATIVE • Beirut & Gulf Operations
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                Antelias Creative Center, Beirut, Lebanon • RAK Traffic System<br>
                ${s||"This is an automated operational notification dispatched by the RAK Traffic Hub."}
              </p>
              <div style="font-size: 10px; color: #cbd5e1;">
                &copy; ${new Date().getFullYear()} RAK 4 CREATIVE. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`}function a(e,t){return e instanceof Error&&e.message?e.message:t}e.s(["getErrorMessage",0,a],40317);let n={provider:"vercel",fromName:"RAK 4 CREATIVE Traffic",fromEmail:"onboarding@resend.dev",replyTo:"farah.y@rak4creative.com",enableAssignmentEmails:!0,enableDailyReminders:!0};async function s(e,t=n){let i,o=process.env.EMAIL_FROM_NAME||e.from?.name||t.fromName||"RAK 4 CREATIVE Traffic",r=process.env.EMAIL_FROM||e.from?.email||t.fromEmail||"onboarding@resend.dev",l=`eml-${Date.now()}-${Math.random().toString(36).substring(2,6)}`,d=new Date().toISOString(),p="simulated",c=process.env.EMAIL_PROVIDER||"simulated",f=("vercel"===c||"resend"===c?process.env.RESEND_API_KEY:"")||("sendgrid"===c?process.env.SENDGRID_API_KEY:"")||("brevo"===c?process.env.BREVO_API_KEY:"")||void 0,g=process.env.EMAIL_WEBHOOK_URL||void 0,m=process.env.EMAIL_REPLY_TO||t.replyTo||r;try{if("simulated"!==c){let t=(process.env.EMAIL_ALLOWED_DOMAINS||"").split(",").map(e=>e.trim().toLowerCase()).filter(Boolean),i=e.to.email.split("@").pop()?.toLowerCase();if(0===t.length)throw Error("Live email delivery is disabled until EMAIL_ALLOWED_DOMAINS is configured on the server.");if(!i||!t.includes("*")&&!t.includes(i))throw Error(`Email delivery to @${i||"unknown"} is not allowed by the server configuration.`)}switch(c){case"vercel":case"resend":{if(!f)throw Error("Resend is not configured on the server. Add RESEND_API_KEY to the cPanel Node.js environment.");let t=r.includes("@")?r:"onboarding@resend.dev",i=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${f}`},body:JSON.stringify({from:`${o} <${t}>`,to:[e.to.email],subject:e.subject,html:e.html,text:e.text,reply_to:m})}),a=await i.json().catch(()=>({}));if(!i.ok){let e=a.message||`Resend error: ${i.statusText}`;if(e.includes("only send testing emails")||e.includes("testing emails"))throw Error(`${e} (Tip: When using onboarding@resend.dev, send test emails to your registered Resend account email: ehabmohsen66@gmail.com, or verify a custom domain to send to any team email).`);throw Error(e)}p="delivered";break}case"sendgrid":{if(!f)throw Error("SendGrid API key is missing. Please set your API Key in Settings or SENDGRID_API_KEY in .env.");let t=await fetch("https://api.sendgrid.com/v3/mail/send",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${f}`},body:JSON.stringify({personalizations:[{to:[{email:e.to.email,name:e.to.name}]}],from:{email:r,name:o},reply_to:{email:m},subject:e.subject,content:[{type:"text/plain",value:e.text},{type:"text/html",value:e.html}]})});if(!t.ok){let e=await t.json().catch(()=>({}));throw Error(e?.errors?.[0]?.message||`SendGrid error: ${t.statusText}`)}p="delivered";break}case"brevo":{if(!f)throw Error("Brevo API key is missing. Please set your API Key in Settings or BREVO_API_KEY in .env.");let t=await fetch("https://api.brevo.com/v3/smtp/email",{method:"POST",headers:{"Content-Type":"application/json","api-key":f},body:JSON.stringify({sender:{name:o,email:r},to:[{name:e.to.name,email:e.to.email}],replyTo:{email:m},subject:e.subject,htmlContent:e.html,textContent:e.text})});if(!t.ok){let e=await t.json().catch(()=>({}));throw Error(e?.message||`Brevo error: ${t.statusText}`)}p="delivered";break}case"webhook":{if(!g)throw Error("Custom Webhook URL is not configured in Settings or EMAIL_WEBHOOK_URL in .env.");let t=await fetch(g,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event:"traffic_email_dispatch",type:e.type,recipient:e.to,sender:{name:o,email:r},subject:e.subject,html:e.html,text:e.text,taskId:e.taskId,taskTitle:e.taskTitle,timestamp:d})});if(!t.ok)throw Error(`Webhook error: ${t.statusText}`);p="delivered";break}default:console.log(`[SIMULATED EMAIL DISPATCH] To: ${e.to.name} <${e.to.email}> | Subject: "${e.subject}" | Type: ${e.type}`),p="simulated"}}catch(e){console.error("Email dispatch failed:",e),p="failed",i=a(e,"Failed to dispatch email")}let b={id:l,taskId:e.taskId,taskTitle:e.taskTitle,recipientId:e.to.id||"usr-custom",recipientName:e.to.name,recipientEmail:e.to.email,senderName:o,senderEmail:r,subject:e.subject,type:e.type,htmlBody:e.html,textBody:e.text,sentAt:d,status:p,provider:c,errorMessage:i};return{success:"failed"!==p,log:b,error:i}}async function l(e,a){let{subject:n,html:l,text:d}=function(e){let{task:a,assignee:n,assigner:s,client:l,baseUrl:d=t}=e,p=`${d}/?task=${a.id}`,c=function(e){switch(e){case"Urgent":return{bg:"#fef2f2",text:"#b91c1c",border:"#fecaca",label:"🔥 URGENT"};case"High":return{bg:"#fffbeb",text:"#b45309",border:"#fde68a",label:"⚡ HIGH PRIORITY"};default:return{bg:"#eef2ff",text:"#4338ca",border:"#e0e7ff",label:"NORMAL"}}}(a.priority),f=`[⏰ DUE TODAY] Task Deadline: ${a.title} - ${l?.name||"Client"}`,g=`Reminder: Task "${a.title}" is due today (${o(a.dueDate)}). Please update your progress.`,m=`
    <tr>
      <td style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 18px 28px; color: #ffffff;" class="mobile-padding">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #fef3c7;">
                ⏰ DEADLINE TODAY
              </div>
              <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 4px;">
                Task deadline is scheduled for today
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `,b=`
    <div style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
      Hello <strong>${i(n.name)}</strong>,<br>
      This is a friendly reminder that the task <strong>"${i(a.title)}"</strong> is scheduled for completion <strong>today (${o(a.dueDate)})</strong>.
    </div>

    <!-- Task Details -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
            <span style="display:inline-block; background-color:${c.bg}; color:${c.text}; border:1px solid ${c.border}; padding:3px 10px; border-radius:6px; font-size:11px; font-weight:800; text-transform:uppercase;">
              ${c.label}
            </span>
            <span style="display:inline-block; background-color:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding:3px 10px; border-radius:6px; font-size:11px; font-weight:800;">
              TARGET: TODAY
            </span>
          </div>

          <div style="font-size: 17px; font-weight: 800; color: #78350f; margin-bottom: 12px;">
            ${i(a.title)}
          </div>

          <div style="font-size: 13px; color: #92400e; margin-bottom: 6px;">
            🏢 <strong>Client:</strong> ${i(l?.name||"Client")}
          </div>
          <div style="font-size: 13px; color: #92400e; margin-bottom: 6px;">
            👤 <strong>Assigned By:</strong> ${i(s?.name||"Management")}
          </div>
          <div style="font-size: 13px; color: #92400e;">
            📊 <strong>Current Status:</strong> ${i(a.status)}
          </div>
        </td>
      </tr>
    </table>

    <!-- Notes Preview -->
    <div style="margin-bottom: 20px;">
      <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 6px;">
        Brief Notes:
      </div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #475569; line-height: 1.5;">
        ${i(a.notes||"No notes.")}
      </div>
    </div>

    <div style="font-size: 13px; color: #334155; line-height: 1.5; text-align: center; margin-top: 16px;">
      Please ensure deliverables are submitted and status is marked as <strong>Completed</strong> or updated in the system today.
    </div>
  `,u=`
RAK 4 CREATIVE - DEADLINE TODAY REMINDER
========================================

Hello ${n.name},

Reminder: The following task is due TODAY:
Title: ${a.title}
Client: ${l?.name||"Client"}
Due Date: ${a.dueDate} (TODAY)
Priority: ${a.priority}
Current Status: ${a.status}

Direct Link to Update: ${p}
`;return{subject:f,html:r({preheader:g,headerBanner:m,contentHtml:b,taskUrl:p,ctaText:"Review & Complete Task Now",footerNote:"Daily deadline reminder from RAK 4 Creative Traffic Engine."}),text:u}}(e);return s({to:{id:e.assignee.id,name:e.assignee.name,email:e.assignee.email},subject:n,html:l,text:d,type:"due_today",taskId:e.task.id,taskTitle:e.task.title},a)}async function d(e,a){let{subject:n,html:l,text:d}=function(e){let{task:a,assignee:n,assigner:s,client:l,baseUrl:d=t,daysOverdue:p=1}=e,c=`${d}/?task=${a.id}`,f=a.emailReminderCount?a.emailReminderCount+1:1,g=`[🚨 OVERDUE - Daily Update #${f}] ${a.title} (${p} day${p>1?"s":""} late)`,m=`URGENT: Task "${a.title}" is ${p} days overdue (Due: ${o(a.dueDate)}). Please update status.`,b=`
    <tr>
      <td style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 18px 28px; color: #ffffff;" class="mobile-padding">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #ffe4e6;">
                🚨 DAILY OVERDUE REMINDER • NOTICE #${f}
              </div>
              <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 4px;">
                Task is past due date (${p} day${p>1?"s":""} late)
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `,u=`
    <div style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
      Hello <strong>${i(n.name)}</strong>,<br>
      This is your <strong>daily update</strong> regarding an outstanding overdue task. The deadline passed <strong>${p} day${p>1?"s":""} ago (${o(a.dueDate)})</strong> and is currently awaiting your completion.
    </div>

    <!-- Overdue Urgency Box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td>
                <span style="display:inline-block; background-color:#be123c; color:#ffffff; padding:3px 10px; border-radius:6px; font-size:11px; font-weight:800;">
                  ⚠️ ${p} DAYS OVERDUE
                </span>
              </td>
              <td align="right">
                <span style="font-size:12px; font-weight:700; color:#9f1239;">
                  Due Date: ${o(a.dueDate)}
                </span>
              </td>
            </tr>
          </table>

          <div style="font-size: 18px; font-weight: 800; color: #881337; line-height: 1.3; margin-bottom: 12px;">
            ${i(a.title)}
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #fecdd3; padding-top: 12px;">
            <tr>
              <td width="50%" valign="top">
                <div style="font-size: 11px; font-weight: 700; color: #9f1239; text-transform: uppercase;">Client</div>
                <div style="font-size: 13px; font-weight: 700; color: #4c0519;">${i(l?.name||"Client")}</div>
              </td>
              <td width="50%" valign="top">
                <div style="font-size: 11px; font-weight: 700; color: #9f1239; text-transform: uppercase;">Manager</div>
                <div style="font-size: 13px; font-weight: 700; color: #4c0519;">${i(s?.name||"Management")}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Task Notes -->
    <div style="margin-bottom: 20px;">
      <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 6px;">
        Task Scope:
      </div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #475569; line-height: 1.5;">
        ${i(a.notes||"No notes.")}
      </div>
    </div>

    <!-- Daily Protocol Notice -->
    <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 14px; text-align: center; margin-bottom: 10px;">
      <div style="font-size: 12px; font-weight: 700; color: #991b1b; margin-bottom: 4px;">
        📌 Daily Escalation Policy
      </div>
      <div style="font-size: 12px; color: #7f1d1d; line-height: 1.4;">
        You will receive <strong>1 daily email update</strong> every morning until this task is marked as <strong>Completed</strong> or updated in the system.
      </div>
    </div>
  `,y=`
RAK 4 CREATIVE - DAILY OVERDUE REMINDER (NOTICE #${f})
===============================================================

URGENT: The following task is ${p} days overdue!
Title: ${a.title}
Client: ${l?.name||"Client"}
Due Date: ${a.dueDate} (${p} days late)
Assigned By: ${s?.name||"Management"}
Current Status: ${a.status}

You will receive 1 email per day until this task is marked as Completed.

Update Task Status: ${c}

RAK 4 CREATIVE Traffic Operations
`;return{subject:g,html:r({preheader:m,headerBanner:b,contentHtml:u,taskUrl:c,ctaText:"Update Task & Mark Completed Now",footerNote:"You will receive 1 daily update for this overdue task until it is marked as Completed."}),text:y}}(e);return s({to:{id:e.assignee.id,name:e.assignee.name,email:e.assignee.email},subject:n,html:l,text:d,type:"overdue",taskId:e.task.id,taskTitle:e.task.title},a)}async function p(e,o){let{subject:a,html:n,text:l}=function(e){let{recipientName:o,recipientEmail:a,baseUrl:n=t}=e,s=`
    <div style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
      Hello <strong>${i(o)}</strong>,<br>
      This is a test notification confirming that the <strong>RAK 4 CREATIVE Email Dispatcher</strong> is successfully configured and connected.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
      <tr>
        <td>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
            Connection Status: <span style="color: #059669;">ONLINE & OPERATIONAL</span>
          </div>
          <div style="font-size: 12px; color: #64748b; line-height: 1.5;">
            • Target Recipient: ${i(a)}<br>
            • Time of Dispatch: ${new Date().toUTCString()}<br>
            • Automated Daily Scan: Active (1 email / day per overdue task)
          </div>
        </td>
      </tr>
    </table>
  `,l=`
RAK 4 CREATIVE - TEST EMAIL
===========================
Hello ${o},

Your email notification setup is verified and active!
Recipient: ${a}
Time: ${new Date().toISOString()}

RAK 4 CREATIVE Traffic System
`;return{subject:"[RAK Traffic] Email Notification System Test Connection",html:r({preheader:"Connection verified! RAK 4 Creative email notification system is working correctly.",contentHtml:s,taskUrl:n,ctaText:"Open RAK Traffic Hub",footerNote:"Test email generated by RAK 4 Creative settings console."}),text:l}}(e);return s({to:{name:e.recipientName,email:e.recipientEmail},subject:a,html:n,text:l,type:"test"},o)}e.s(["DEFAULT_EMAIL_CONFIG",0,n,"sendDueTodayNotification",0,l,"sendEmail",0,s,"sendOverdueDailyNotification",0,d,"sendTestNotification",0,p],86599)}];

//# sourceMappingURL=src_lib_emailService_ts_0p1_zu8._.js.map