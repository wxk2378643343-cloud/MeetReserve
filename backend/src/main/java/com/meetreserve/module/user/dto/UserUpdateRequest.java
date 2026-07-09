package com.meetreserve.module.user.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {

    private String realName;
    private String role;
    private Integer status;
}
