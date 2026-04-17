// react-bootstrap
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';

// third-party
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// project-imports
import MainCard from 'components/MainCard';

// assets
import UserAvatar1 from 'assets/images/user/avatar-1.png';

const testimonials = [
  {
    quote:
      'PlanetCare made it incredibly easy to track our Scope 1 and 2 emissions. The automated calculations save our team hours every month and the dashboard gives management exactly what they need at a glance.',
    name: 'Priya M.',
    role: 'Sustainability Manager',
    avatar: UserAvatar1
  },
  {
    quote:
      'We were previously using spreadsheets for GHG reporting. Switching to PlanetCare cut our reporting time by 60% and gave us the confidence that our numbers are accurate and audit-ready.',
    name: 'Rajan K.',
    role: 'Environmental Compliance Officer',
    avatar: UserAvatar1
  },
  {
    quote:
      'The multi-site management feature is a game changer. We manage 4 facilities and PlanetCare lets us consolidate all emission data into one report with just a few clicks.',
    name: 'Anitha R.',
    role: 'Operations Director',
    avatar: UserAvatar1
  },
  {
    quote:
      'Setting up our carbon reduction goals and tracking progress month-over-month has never been this straightforward. PlanetCare keeps our whole team aligned on our net-zero targets.',
    name: 'Deepak S.',
    role: 'CSR Head',
    avatar: UserAvatar1
  }
];

// ==============================|| LANDING - TESTIMONIAL BLOCK ||============================== //

export default function ClientTestimonials() {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    centerMode: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
          centerMode: false
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: false
        }
      },
      {
        breakpoint: 0,
        settings: {
          slidesToShow: 1,
          centerMode: false
        }
      }
    ]
  };

  return (
    <section className="communities-section">
      <Container>
        <Row className="justify-content-center text-center">
          <Col md={8} xl={6}>
            <div className="title mb-4">
              <motion.h2
                className="section-title"
                initial={{ opacity: 0, y: 50 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
              >
                What Our <strong className="landing-background-image">Clients Say</strong>
              </motion.h2>
              <motion.p
                className="mt-lg-4 mt-2"
                initial={{ opacity: 0, y: 50 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Organizations across industries trust PlanetCare to simplify their carbon reporting. Here&apos;s what they have to say.
              </motion.p>
            </div>
          </Col>
        </Row>
      </Container>
      <motion.div
        className="slider-container position-relative z-3"
        initial={{ opacity: 0, y: 50 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
      >
        {/* @ts-ignore https://github.com/akiran/react-slick/issues/2336 */}
        <Slider {...settings} className="comminuties-slides">
          {testimonials.map((testimonial, index) => (
            <div key={index}>
              <MainCard className="mx-2">
                <div className="quote-icon">
                  <i className="ti ti-quote-filled" />
                </div>
                <h3 className="h5">{testimonial.quote}</h3>
                <div className="text-end">
                  <p className="my-3 text-primary">- {testimonial.role}</p>
                  <div className="d-inline-flex align-items-center">
                    <div className="flex-shrink-0">
                      <Image src={testimonial.avatar} alt="user image" className="img-radius wid-40" />
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-0">{testimonial.name}</h6>
                      <p className="mb-0 text-muted text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </MainCard>
            </div>
          ))}
        </Slider>
      </motion.div>
    </section>
  );
}
