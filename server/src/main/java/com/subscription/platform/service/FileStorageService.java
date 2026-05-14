package com.subscription.platform.service;

import com.subscription.platform.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class FileStorageService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024L; // 10MB
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
        "image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"
    );

    @Value("${file.upload.dir}")
    private String uploadDir;

    @Value("${file.base-url}")
    private String baseUrl;

    /**
     * 图片上传类型枚举
     */
    public enum ImageType {
        AVATAR("avatars"),           // 用户头像
        BANNER("banners"),           // 轮播图
        ARTICLE("articles"),         // 文章图片
        CATEGORY("categories"),      // 分类图标
        POSTER("posters"),           // 分享海报
        EDITOR("editor"),            // 富文本编辑器图片
        OTHER("others");             // 其他

        private final String folder;

        ImageType(String folder) {
            this.folder = folder;
        }

        public String getFolder() {
            return folder;
        }
    }

    /**
     * 图片信息DTO
     */
    public static class ImageInfo {
        private String name;
        private String url;
        private long size;
        private String type;
        private String uploadTime;

        public ImageInfo(String name, String url, long size, String type, String uploadTime) {
            this.name = name;
            this.url = url;
            this.size = size;
            this.type = type;
            this.uploadTime = uploadTime;
        }

        // Getters
        public String getName() { return name; }
        public String getUrl() { return url; }
        public long getSize() { return size; }
        public String getType() { return type; }
        public String getUploadTime() { return uploadTime; }
    }

    /**
     * 存储文件（带分类）
     * @param file 上传的文件
     * @param imageType 图片类型
     * @return 文件访问URL
     */
    public String store(MultipartFile file, ImageType imageType) {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        
        // 生成唯一文件名：类型前缀_UUID_时间戳.扩展名
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String timestamp = String.valueOf(System.currentTimeMillis());
        String filename = imageType.name().toLowerCase() + "_" + uuid.substring(0, 16) + "_" + timestamp.substring(timestamp.length() - 6) + extension;
        
        // 构建存储路径：uploads/{type}/{yyyy-MM}/{filename}
        String dateFolder = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        String relativePath = imageType.getFolder() + "/" + dateFolder + "/" + filename;

        try {
            // 创建完整的目录结构
            Path uploadPath = Paths.get(uploadDir, imageType.getFolder(), dateFolder)
                .toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            
            // 保存文件
            Path targetPath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            
            log.info("文件上传成功: type={}, path={}, size={}KB", 
                imageType, relativePath, file.getSize() / 1024);
            
            // 返回访问URL
            return baseUrl + "/uploads/" + relativePath;
        } catch (IOException e) {
            log.error("文件上传失败: {}", e.getMessage(), e);
            throw new RuntimeException("文件上传失败: " + e.getMessage());
        }
    }

    /**
     * 存储文件（默认类型为OTHER）
     * @param file 上传的文件
     * @return 文件访问URL
     */
    public String store(MultipartFile file) {
        return store(file, ImageType.OTHER);
    }

    /**
     * 删除文件
     * @param fileUrl 文件URL
     * @return 是否删除成功
     */
    public boolean delete(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return false;
        }

        try {
            // 从URL中提取相对路径
            String relativePath = fileUrl.replace(baseUrl + "/uploads/", "");
            Path filePath = Paths.get(uploadDir, relativePath).toAbsolutePath().normalize();
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("文件删除成功: {}", relativePath);
                return true;
            } else {
                log.warn("文件不存在: {}", relativePath);
                return false;
            }
        } catch (IOException e) {
            log.error("文件删除失败: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * 验证文件
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("文件不能为空");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("文件大小不能超过10MB");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("只支持 JPG, PNG, GIF, WebP 格式的图片");
        }

        // 验证文件扩展名
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            String extension = getFileExtension(originalFilename).toLowerCase();
            if (!extension.matches("\\.(jpg|jpeg|png|gif|webp)")) {
                throw new BadRequestException("不支持的文件扩展名");
            }
        }
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg"; // 默认扩展名
        }
        return filename.substring(filename.lastIndexOf(".")).toLowerCase();
    }

    /**
     * 获取文件大小（格式化）
     */
    public String getFormattedFileSize(long size) {
        if (size < 1024) {
            return size + " B";
        } else if (size < 1024 * 1024) {
            return String.format("%.2f KB", size / 1024.0);
        } else {
            return String.format("%.2f MB", size / (1024.0 * 1024.0));
        }
    }

    /**
     * 获取所有已上传的图片列表
     * @param type 图片类型，null表示获取所有类型
     * @return 图片信息列表
     */
    public List<ImageInfo> listImages(String type) {
        List<ImageInfo> images = new ArrayList<>();
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            if (!Files.exists(uploadPath)) {
                log.warn("上传目录不存在: {}", uploadPath);
                return images;
            }

            // 如果指定了类型，只扫描该类型的目录
            if (type != null && !type.isEmpty() && !"all".equals(type)) {
                Path typePath = uploadPath.resolve(type);
                if (Files.exists(typePath)) {
                    scanDirectory(typePath, type, images);
                }
            } else {
                // 扫描所有类型目录
                for (ImageType imageType : ImageType.values()) {
                    Path typePath = uploadPath.resolve(imageType.getFolder());
                    if (Files.exists(typePath)) {
                        scanDirectory(typePath, imageType.getFolder(), images);
                    }
                }
            }

            // 按上传时间倒序排序
            images.sort((a, b) -> b.getUploadTime().compareTo(a.getUploadTime()));
            
            log.debug("扫描到 {} 张图片", images.size());
        } catch (IOException e) {
            log.error("扫描图片目录失败: {}", e.getMessage(), e);
        }

        return images;
    }

    /**
     * 递归扫描目录获取图片文件
     */
    private void scanDirectory(Path directory, String type, List<ImageInfo> images) throws IOException {
        Path uploadBasePath = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        Files.walkFileTree(directory, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
                if (attrs.isRegularFile() && isImageFile(file)) {
                    try {
                        String fileName = file.getFileName().toString();
                        // 使用绝对路径进行relativize操作
                        Path absoluteFile = file.toAbsolutePath().normalize();
                        String relativePath = uploadBasePath.relativize(absoluteFile).toString().replace("\\", "/");
                        String url = baseUrl + "/uploads/" + relativePath;
                        long size = attrs.size();
                        String uploadTime = attrs.creationTime().toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDateTime()
                            .toString();

                        images.add(new ImageInfo(fileName, url, size, type, uploadTime));
                    } catch (Exception e) {
                        log.warn("处理文件失败: {}, error: {}", file, e.getMessage());
                    }
                }
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult visitFileFailed(Path file, IOException exc) {
                log.warn("访问文件失败: {}", file, exc);
                return FileVisitResult.CONTINUE;
            }
        });
    }

    /**
     * 判断是否为图片文件
     */
    private boolean isImageFile(Path file) {
        String fileName = file.getFileName().toString().toLowerCase();
        return fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") ||
               fileName.endsWith(".png") || fileName.endsWith(".gif") ||
               fileName.endsWith(".webp");
    }
}
