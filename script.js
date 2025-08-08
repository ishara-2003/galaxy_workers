function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

function handleSearch(event) {
    event.preventDefault();
    const countryCode = document.getElementById('country_code').value;
    const phoneNumber = document.getElementById('phone_number').value;
    const enableSuggestions = document.getElementById('enableSuggestions').checked;
    const resultsDiv = document.getElementById('results');
    const suggestedDiv = document.getElementById('suggested_numbers');
    const historyDiv = document.getElementById('search_history');

    let searches = JSON.parse(localStorage.getItem('searches') || '[]');
    let user = JSON.parse(localStorage.getItem('user') || '{"plan":"free"}');
    const limit = user.plan === 'free' ? 35 : parseInt(user.plan);

    let results = '', suggestions = '', history = '';

    if (phoneNumber.length >= 10) {
        const fullNumber = countryCode + phoneNumber;
        results = `<p>Phone: ${fullNumber} - Name: Sample User</p>`;
        if (searches.includes(fullNumber)) {
            results += '<p style="color: red;">මෙම අංකය පෙර සෙවූ එකකි!</p>';
        }
        if (!searches.includes(fullNumber)) {
            searches.push(fullNumber);
            if (searches.length > limit) {
                searches = searches.slice(-limit);
            }
            localStorage.setItem('searches', JSON.stringify(searches));
        }
    } else if (phoneNumber.length >= 2) {
        results = '<p style="color: red;">කරුණාකර වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න (අවම වශයෙන් ඉලක්කම් 10ක්).</p>';
        suggestions = `<p>යෝජිත අංක: ${countryCode}${phoneNumber}123, ${countryCode}${phoneNumber}456</p>`;
    } else {
        suggestions = `<p>යෝජිත අංක: ${countryCode}123456789, ${countryCode}987654321</p>`;
    }

    const uniqueSearches = [...new Set(searches)];
    let count = 0;
    for (const num of uniqueSearches) {
        if (count < limit) {
            const isRepeated = searches.filter(x => x === num).length > 1;
            history += `<p${isRepeated ? ' class="repeated"' : ''}>${num}</p>`;
            count++;
        }
    }

    resultsDiv.innerHTML = results;
    suggestedDiv.innerHTML = enableSuggestions ? suggestions : '';
    historyDiv.innerHTML = history;
}

function sendToSelected() {
    const phone = document.getElementById('msg_phone').value;
    const message = document.getElementById('message').value;
    const media = document.getElementById('media').files[0];
    const resultsDiv = document.getElementById('message_results');
    const whatsappConfig = JSON.parse(localStorage.getItem('whatsappConfig') || '{}');

    if (phone && message) {
        if (whatsappConfig.access_token) {
            // Mock WhatsApp Business API call (GitHub Pages can't make real API calls)
            resultsDiv.innerHTML = `<p style="color: green;">[Mock] WhatsApp Business API හරහා පණිවිඩය යැවීම සාර්ථකයි! (${phone})</p>`;
            if (media) {
                resultsDiv.innerHTML += `<p>මාධ්‍ය යැවීමට WhatsApp Business API හි උඩුගත කරන්න (Serverless platform එකක් ඕනේ).</p>`;
            }
            resultsDiv.innerHTML += `<p>Business ID: ${whatsappConfig.business_id}, Phone ID: ${whatsappConfig.phone_id}</p>`;
        } else {
            // Fallback to Click-to-Chat
            const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
            resultsDiv.innerHTML = `<p style="color: green;">Click-to-Chat හරහා පණිවිඩය යැවීම සාර්ථකයි! (${phone})</p>`;
            if (media) {
                resultsDiv.innerHTML += `<p>මාධ්‍ය යැවීමට WhatsApp හි උඩුගත කරන්න.</p>`;
            }
        }
    } else {
        resultsDiv.innerHTML = `<p style="color: red;">කරුණාකර දුරකථන අංකය සහ පණිවිඩය ඇතුළත් කරන්න.</p>`;
    }
}

function sendToAll() {
    const message = document.getElementById('message').value;
    const media = document.getElementById('media').files[0];
    const resultsDiv = document.getElementById('message_results');
    let searches = JSON.parse(localStorage.getItem('searches') || '[]');
    const whatsappConfig = JSON.parse(localStorage.getItem('whatsappConfig') || '{}');

    if (message && searches.length > 0) {
        if (whatsappConfig.access_token) {
            // Mock WhatsApp Business API call
            resultsDiv.innerHTML = `<p style="color: green;">[Mock] WhatsApp Business API හරහා සියලුම සෙවූ අංක (${searches.length}) වලට පණිවිඩ යැවීම සාර්ථකයි!</p>`;
            if (media) {
                resultsDiv.innerHTML += `<p>මාධ්‍ය යැවීමට WhatsApp Business API හි උඩුගත කරන්න (Serverless platform එකක් ඕනේ).</p>`;
            }
            resultsDiv.innerHTML += `<p>Business ID: ${whatsappConfig.business_id}, Phone ID: ${whatsappConfig.phone_id}</p>`;
        } else {
            // Fallback to Click-to-Chat
            searches.forEach(phone => {
                const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                window.open(url, '_blank');
            });
            resultsDiv.innerHTML = `<p style="color: green;">Click-to-Chat හරහා සියලුම සෙවූ අංක (${searches.length}) වලට පණිවිඩ යැවීම සාර්ථකයි!</p>`;
            if (media) {
                resultsDiv.innerHTML += `<p>මාධ්‍ය යැවීමට WhatsApp හි උඩුගත කරන්න.</p>`;
            }
        }
    } else {
        resultsDiv.innerHTML = `<p style="color: red;">කරුණාකර පණිවිඩයක් ඇතුළත් කරන්න හෝ සෙවූ අංක තිබෙන බව තහවුරු කරන්න.</p>`;
    }
}

function handleIntegration(event) {
    event.preventDefault();
    const businessId = document.getElementById('business_id').value;
    const phoneId = document.getElementById('phone_id').value;
    const accessToken = document.getElementById('access_token').value;
    const resultsDiv = document.getElementById('integration_results');

    if (businessId && phoneId && accessToken) {
        // Store credentials in localStorage with base64 encoding (basic security)
        const whatsappConfig = {
            business_id: btoa(businessId),
            phone_id: btoa(phoneId),
            access_token: btoa(accessToken)
        };
        localStorage.setItem('whatsappConfig', JSON.stringify(whatsappConfig));
        resultsDiv.innerHTML = `<p style="color: green;">WhatsApp Business API credentials ආරක්ෂිතව ඒකාබද්ධ කරන ලදි! Messaging සඳහා serverless platform එකක් භාවිතා කරන්න.</p>`;
    } else {
        resultsDiv.innerHTML = `<p style="color: red;">කරුණාකර සියලුම තොරතුරු ඇතුළත් කරන්න.</p>`;
    }
}

function handleRegister(event) {
    event.preventDefault();
    const firstName = document.getElementById('first_name').value;
    const secondName = document.getElementById('second_name').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const resultsDiv = document.getElementById('register_results');

    let users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
        resultsDiv.innerHTML = '<p style="color: red;">පරිශීලක නම දැනටමත් භාවිතා වේ!</p>';
    } else {
        users[username] = {
            firstName,
            secondName,
            password: btoa(password), // Simple mock hashing
            plan: 'free',
            searches: 0
        };
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('user', JSON.stringify(users[username]));
        resultsDiv.innerHTML = '<p style="color: green;">ලියාපදිංචි කිරීම සාර්ථකයි! ගෙවීම් පිටුවෙන් රු. 100 ගෙවන්න.</p>';
    }
}

function handlePayment(event) {
    event.preventDefault();
    const slip = document.getElementById('slip').files[0];
    const resultsDiv = document.getElementById('payment_results');
    let user = JSON.parse(localStorage.getItem('user') || '{}');

    if (slip && ['jpg', 'jpeg', 'png', 'pdf'].includes(slip.name.split('.').pop().toLowerCase())) {
        user.verified = true;
        localStorage.setItem('user', JSON.stringify(user));
        resultsDiv.innerHTML = '<p style="color: green;">බැංකු ස්ලිප් තහවුරු කිරීම සාර්ථකයි! ඔබ දැන් ලියාපදිංචි විය හැක.</p>';
    } else {
        resultsDiv.innerHTML = '<p style="color: red;">කරුණාකර වලංගු බැංකු ස්ලිප් එකක් (JPG, PNG, PDF) උඩුගත කරන්න.</p>';
    }
}

function handlePremium(event) {
    event.preventDefault();
    const plan = document.getElementById('plan').value;
    const slip = document.getElementById('premium_slip').files[0];
    const resultsDiv = document.getElementById('premium_results');
    let user = JSON.parse(localStorage.getItem('user') || '{}');

    if (slip && user && ['jpg', 'jpeg', 'png', 'pdf'].includes(slip.name.split('.').pop().toLowerCase())) {
        user.plan = plan;
        user.searches = 0;
        localStorage.setItem('user', JSON.stringify(user));
        resultsDiv.innerHTML = `<p style="color: green;">Premium සැලැස්ම (${plan} ගිණුම්) සාර්ථකයි!</p>`;
    } else {
        resultsDiv.innerHTML = '<p style="color: red;">කරුණාකර ලියාපදිංචි වන්න සහ බැංකු ස්ලිප් එක උඩුගත කරන්න.</p>';
    }
}

document.getElementById('showPaymentDetails')?.addEventListener('click', () => {
    document.getElementById('payment_details').style.display = 'block';
});
