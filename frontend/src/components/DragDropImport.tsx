// frontend/src/components/DragDropImport.tsx
import React, { useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useLanguage } from '../context/LanguageContext';

interface DragDropImportProps {
  onDrop: (files: FileList) => void;
  accept?: string; // e.g., ".json,.csv" or "application/json"
  children: ReactNode;
  multiple?: boolean;
  disabled?: boolean;
  onError?: (error: string) => void;
}

export const DragDropImport: React.FC<DragDropImportProps> = ({
  onDrop,
  accept = '*',
  children,
  multiple = false,
  disabled = false,
  onError,
}) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      dragCounter.current += 1;
      setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      dragCounter.current -= 1;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      if (!isDragging) {
        setIsDragging(true);
      }
    },
    [disabled, isDragging]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;
      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length === 0) return;

      // Filter by accept
      let validFiles: File[] = [];
      let invalidCount = 0;

      if (accept === '*') {
        validFiles = Array.from(files);
      } else {
        const extensions = accept.split(',').map((s) => s.trim());
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const ext = '.' + file.name.split('.').pop()?.toLowerCase();
          const mimeType = file.type;
          const isValid = extensions.some((pattern) => {
            if (pattern.startsWith('.')) {
              return ext === pattern.toLowerCase();
            } else {
              return mimeType === pattern;
            }
          });
          if (isValid) {
            validFiles.push(file);
          } else {
            invalidCount++;
          }
        }
      }

      if (validFiles.length === 0) {
        if (onError) {
          onError(`No valid files found. Accepted: ${accept}`);
        }
        return;
      }

      if (invalidCount > 0 && onError) {
        onError(`${invalidCount} file(s) ignored. Only ${accept} files are accepted.`);
      }

      if (!multiple && validFiles.length > 1) {
        // Take only the first file
        const dt = new DataTransfer();
        dt.items.add(validFiles[0]);
        onDrop(dt.files);
      } else {
        // Build a new FileList from validFiles
        const dt = new DataTransfer();
        validFiles.forEach((f) => dt.items.add(f));
        onDrop(dt.files);
      }
    },
    [accept, multiple, onDrop, disabled, onError]
  );

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
      {isDragging && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              backgroundColor: 'background.paper',
            }}
          >
            <Typography variant="h5" gutterBottom>
              {t('dropFilesHere')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {accept !== '*'
                ? t('acceptedFiles', { accept })
                : t('allFilesAccepted')}
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};