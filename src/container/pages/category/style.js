import styled from 'styled-components';

export const CategoryListWrapper = styled.div`
  .search-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .left-actions {
      display: flex;
      gap: 8px;
    }

    .right-actions {
      display: flex;
      gap: 8px;
    }
  }

  .ant-table-thead > tr > th {
    background-color: #F8F9FB;
    color: #333;
    font-weight: 500;
  }

  .ant-table-tbody > tr > td {
    color: #333;
  }

  .table-actions {
    display: flex;
    align-items: center;
    gap: 8px;

    .btn-icon {
      width: 32px;
      height: 32px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.ant-btn-info {
        background-color: #0073A8;
        border-color: #0073A8;
        &:hover {
          background-color: rgba(0, 115, 168, 0.85);
          border-color: rgba(0, 115, 168, 0.85);
        }
      }
      
      &.ant-btn-danger {
        background-color: #FF4D4F;
        border-color: #FF4D4F;
        &:hover {
          background-color: rgba(255, 77, 79, 0.85);
          border-color: rgba(255, 77, 79, 0.85);
        }
      }
    }
  }

  .ant-pagination {
    margin-top: 16px;
  }

  .ant-pagination-total-text {
    color: #666;
  }

  .ant-table-column-sorter {
    color: #666;
  }

  .ant-input {
    border-radius: 4px;
  }

  .ant-btn-primary {
    border-radius: 4px;
  }

  .status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    
    &.active {
      background-color: #e6f7ff;
      color: #1890ff;
    }
    
    &.inactive {
      background-color: #fff1f0;
      color: #ff4d4f;
    }
    
    &.pending {
      background-color: #fff7e6;
      color: #fa8c16;
    }
  }

  .table-actions {
    button {
      width: 32px;
      height: 32px;
      padding: 0;
      margin-right: 8px;
      &:last-child {
        margin-right: 0;
      }
    }
    .btn-icon {
      width: 32px;
      height: 32px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`; 