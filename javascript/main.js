$('#hero-slider').slick({
    dots: false,
    arrows: false,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    cssEase: 'linear'
});

$('document').ready(function () {
    const marquee = $('#marquee');
    let i = 0;
    setInterval(() => {
        i++;
        marquee.css('transform', `translateX(-${i * 200}px)`);
        if (i % 4 === 0) {
            const slide = marquee.find('.music-container').first();
            slide.clone().appendTo(marquee);
        }
    }, 2000);

    $('.header-mobile .btn-menu').click(function () {
        $('.mobile-menu-container').toggleClass('active');
    });
    $('.mobile-menu-container .btn-menu,.mobile-menu-container .btn-voltar').click(function () {
        $('.mobile-menu-container').toggleClass('active');
    });
});

