package com.meetreserve.module.user.dto;

import lombok.Data;

@Data
public class UserVO {

    private Long id;
    private String username;
    private String realName;
    private String role;
    private Integer status;
    private String createdAt;
}
