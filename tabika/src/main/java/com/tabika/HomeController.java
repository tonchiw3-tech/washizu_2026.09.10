package com.tabika;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.ui.Model;

@Controller
public class HomeController {

    private final ModelCourseMapper modelCourseMapper;

    public HomeController(ModelCourseMapper modelCourseMapper) {
        this.modelCourseMapper = modelCourseMapper;
    }

    @GetMapping("/")
    public String home() {
        return "index";
    }

    @GetMapping("/courses")
    public String courses(Model model) {
        model.addAttribute("courses", modelCourseMapper.findAll());
        return "model-courses";
    }

    @GetMapping("/courses/{id}")
    public String courseDetail(@PathVariable int id, Model model) {
        ModelCourse course = modelCourseMapper.findById(id);
        if (course == null) {
            return "redirect:/courses";
        }
        model.addAttribute("course", course);
        return "course-detail";
    }
}
