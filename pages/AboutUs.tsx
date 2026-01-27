
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ShieldCheck, Leaf, PenTool } from 'lucide-react';

const ValueItem = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="bg-white p-10 rounded-[3rem] shadow-sm border border-stone-100 group transition-all duration-500 hover:shadow-2xl hover:shadow-floral-rose/10"
  >
    <div className="w-16 h-16 rounded-2xl bg-floral-rose/10 flex items-center justify-center mb-8 group-hover:bg-floral-rose group-hover:text-white transition-all duration-500 text-floral-rose">
      <Icon size={32} />
    </div>
    <h3 className="font-serif text-2xl text-floral-deep mb-4">{title}</h3>
    <p className="text-stone-500 leading-relaxed font-light">{desc}</p>
  </motion.div>
);

export const AboutUs: React.FC = () => {
  return (
    <div className="bg-floral-petal">
      {/* Sub Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl"
          >
            <span className="text-floral-rose font-bold tracking-[0.3em] uppercase text-xs mb-6 block">Câu chuyện của chúng tôi</span>
            <h1 className="font-serif text-6xl md:text-8xl text-floral-deep mb-12 leading-[1.1]">
              Nơi mỗi đóa hoa kể một <span className="italic font-normal text-floral-rose">giai điệu tâm hồn.</span>
            </h1>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
            <div className="w-full h-full bg-[url('https://images.pexels.com/photos/1122621/pexels-photo-1122621.jpeg')] bg-cover bg-center grayscale" />
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl relative z-10">
              <img 
                src="https://images.pexels.com/photos/2113994/pexels-photo-2113994.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Florist working" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-floral-rose/20 rounded-full blur-3xl -z-0" />
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-floral-gold/10 rounded-full blur-2xl -z-0" />
          </div>
          
          <div className="space-y-10">
            <h2 className="font-serif text-5xl text-floral-deep leading-tight">Triết lý của <br/><span className="italic text-floral-rose">ChinChin</span></h2>
            <div className="space-y-6 text-xl text-stone-600 font-light leading-relaxed italic">
              <p>
                "Tại Tiệm hoa của ChinChin, chúng tôi tin rằng hoa không chỉ là vật trang trí. Chúng là ngôn ngữ của trái tim khi lời nói trở nên vụng về."
              </p>
              <p className="not-italic text-base text-stone-500">
                Khởi đầu từ một studio nhỏ vào năm 2020, ChinChin mang sứ mệnh tái định nghĩa trải nghiệm tặng quà. Chúng tôi kết hợp kỹ thuật cắm hoa đương đại với sự tuyển chọn khắt khe những loại trái cây thượng hạng để tạo nên những giỏ quà không chỉ đẹp ở phần nhìn mà còn trọn vẹn ở phần tâm.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-6">
              <div>
                <h4 className="font-serif text-4xl text-floral-gold mb-2">5000+</h4>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Thông điệp gửi đi</p>
              </div>
              <div>
                <h4 className="font-serif text-4xl text-floral-gold mb-2">15+</h4>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Nghệ nhân tâm huyết</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="font-serif text-5xl text-floral-deep mb-6">Giá trị cốt lõi</h2>
            <p className="text-stone-500 font-light">Những nguyên tắc vàng giúp chúng tôi giữ trọn niềm tin từ khách hàng trong suốt những năm qua.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <ValueItem 
              icon={PenTool} 
              title="Thiết kế độc bản" 
              desc="Mỗi tác phẩm đều được thiết kế dựa trên câu chuyện riêng của khách hàng, đảm bảo không có hai giỏ hoa nào hoàn toàn giống nhau." 
            />
            <ValueItem 
              icon={Leaf} 
              title="Bền vững & Tươi mới" 
              desc="Chúng tôi ưu tiên nguồn hoa nhập trực tiếp trong ngày và sử dụng vật liệu đóng gói thân thiện với môi trường." 
            />
            <ValueItem 
              icon={ShieldCheck} 
              title="Chất lượng thượng hạng" 
              desc="Từ những đóa hồng Ohara đến những quả nho mẫu đơn, mọi thành phần đều qua 3 bước kiểm tra nghiêm ngặt." 
            />
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-24 bg-floral-deep relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="font-serif text-5xl text-white mb-10 leading-tight">Bạn đã sẵn sàng tạo nên <br/><span className="italic text-floral-rose">khoảnh khắc đáng nhớ?</span></h2>
          <button className="px-12 py-5 bg-floral-rose text-white rounded-full font-bold tracking-widest uppercase hover:scale-105 transition-transform shadow-2xl">
            Bắt đầu câu chuyện của bạn
          </button>
        </div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />
      </section>
    </div>
  );
};
