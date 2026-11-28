const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav');
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open?'true':'false');menu.textContent=open?'×':'☰'});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false');if(menu)menu.textContent='☰'}));
const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();

// Public enquiry API. The server separately enforces its ALLOWED_ORIGINS policy.
const ENQUIRY_API='https://rygate-digital-platform-staging.onrender.com/api/enquiries';
const quoteForm=document.getElementById('quoteForm');
const formStatus=document.getElementById('formStatus');
const submitButton=quoteForm?.querySelector('button[type="submit"]');

document.querySelectorAll('[data-form-kind="assessment"]').forEach(link=>{
  link.addEventListener('click',()=>{
    const assessment=document.querySelector('[name="riskAssessmentRequested"]');
    const quotation=document.querySelector('[name="quotationRequested"]');
    if(assessment)assessment.value='true';
    if(quotation)quotation.value='false';
    const heading=quoteForm?.querySelector('.form-title');
    if(heading)heading.textContent='Security assessment request';
    if(formStatus)formStatus.textContent='Complete the fields below to request a security assessment.';
  });
});

quoteForm?.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!quoteForm.reportValidity())return;
  const data=new FormData(quoteForm);
  const payload={
    contactName:String(data.get('contactName')||'').trim(),
    jobTitle:'Authorised Representative',
    companyName:String(data.get('companyName')||'').trim(),
    email:String(data.get('email')||'').trim(),
    phone:String(data.get('phone')||'').trim(),
    preferredContactMethod:String(data.get('preferredContactMethod')||'PHONE'),
    siteAddress:String(data.get('siteAddress')||'').trim(),
    suburbOrCity:String(data.get('suburbOrCity')||'').trim(),
    province:String(data.get('province')||''),
    siteType:String(data.get('siteType')||''),
    servicesRequired:data.getAll('servicesRequired').map(String),
    numberOfGuards:Number(data.get('numberOfGuards')),
    shiftCoverage:String(data.get('shiftCoverage')||''),
    armedRequirement:String(data.get('armedRequirement')||''),
    targetStartDate:String(data.get('targetStartDate')||''),
    riskAssessmentRequested:data.get('riskAssessmentRequested')==='true',
    quotationRequested:data.get('quotationRequested')==='true',
    securityRequirements:String(data.get('securityRequirements')||'').trim()
  };
  if(submitButton)submitButton.disabled=true;
  if(formStatus)formStatus.textContent='Submitting your enquiry securely…';
  try{
    const response=await fetch(ENQUIRY_API,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok){
      const message=result.errors?.join(' ')||result.error||'Your enquiry could not be submitted. Please try again.';
      throw new Error(message);
    }
    const reference=result.referenceNumber||result.enquiry?.referenceNumber||'';
    if(formStatus)formStatus.textContent=reference
      ? 'Thank you. Your enquiry has been received. Reference: '+reference+'. Our team will contact you.'
      : 'Thank you. Your enquiry has been received by Rygate Tactical Solutions.';
    quoteForm.reset();
    const assessment=document.querySelector('[name="riskAssessmentRequested"]');
    const quotation=document.querySelector('[name="quotationRequested"]');
    if(assessment)assessment.value='false';
    if(quotation)quotation.value='true';
    const heading=quoteForm.querySelector('.form-title');
    if(heading)heading.textContent='Your enquiry';
  }catch(error){
    if(formStatus)formStatus.textContent=error instanceof Error?error.message:'Submission failed. Please try again.';
  }finally{
    if(submitButton)submitButton.disabled=false;
  }
});
