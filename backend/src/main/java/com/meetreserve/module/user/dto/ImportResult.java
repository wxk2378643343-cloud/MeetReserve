package com.meetreserve.module.user.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ImportResult {

    private int total;
    private int success;
    private int failed;
    private List<ImportError> errors = new ArrayList<>();

    public void addError(int row, String username, String reason) {
        ImportError error = new ImportError();
        error.setRow(row);
        error.setUsername(username);
        error.setReason(reason);
        errors.add(error);
        failed++;
    }

    public void incrementSuccess() {
        success++;
    }

    @Data
    public static class ImportError {
        private int row;
        private String username;
        private String reason;
    }
}
