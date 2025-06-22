import { Star } from "lucide-react";
import { motion } from "motion/react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer at Google",
    content:
      "IntraRefer helped me land my dream job! The referral process was smooth and the platform made networking so much easier.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b589?w=150",
  },
  {
    name: "Rahul Verma",
    role: "Product Manager at Microsoft",
    content:
      "As a referrer, I love how easy it is to post opportunities and connect with qualified candidates. Great platform!",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
  {
    name: "Anita Desai",
    role: "Data Scientist at Amazon",
    content:
      "The AI matching feature is incredible. I got matched with referrals that perfectly aligned with my skills and career goals.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Success Stories
          </h2>
          <p className="text-xl text-gray-600">
            Hear from professionals who've transformed their careers through
            IntraRefer
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "{testimonial.content}"
              </p>
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
