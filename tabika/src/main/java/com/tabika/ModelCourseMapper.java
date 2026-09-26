package com.tabika;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ModelCourseMapper {
    List<ModelCourse> findAll();

    ModelCourse findById(int id);
}
