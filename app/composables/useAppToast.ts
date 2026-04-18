export const useAppToast = () => {
  const toast = useToast();

  const showSuccess = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: "success",
      icon: "i-heroicons-check-circle",
    });
  };

  const showError = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: "error",
      icon: "i-heroicons-x-circle",
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: "info",
      icon: "i-heroicons-information-circle",
    });
  };

  return { showSuccess, showError, showInfo };
};
