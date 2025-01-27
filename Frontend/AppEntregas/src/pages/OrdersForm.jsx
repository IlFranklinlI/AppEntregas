import { useState, useEffect } from "react";
import { Form, Input, Button, Select, Modal, message,Spin } from "antd";
import { useOrders } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";

const { Option } = Select;

export default function OrdersForm() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [dataloading, setDataloading] = useState(true)
  const [products, setProducts] = useState([]);
  const [productModalVisible, setProductModalVisible] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState(null);
  const { createOrder } = useOrders();
  const { getUsers, errors } = useAuth();
  const navigate = useNavigate();
  
  
  useEffect(() => {
    const fetchUsersAndRepartidores = async () => {
      try {
        setDataloading(true); 
        const response = await getUsers()
        console.log(response)
        const { users, repartidores } = response;

        
        setUsers(users);
        setRepartidores(repartidores);
        setDataloading(false); 
      } catch (error) {
        console.error('Error fetching users and repartidores:', error);
        setDataloading(false); 
      }
    };

    fetchUsersAndRepartidores();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log(values)
      console.log(products)
      await createOrder({
        ...values,
        products
      });
      message.success("Orden creada exitosamente");
      navigate("/orders"); 
    } catch (error) {
      message.error("Error creando la orden");
    }
    setLoading(false);
  };

  const handleAddProduct = () => {
    setEditingProduct({ productLabel: "", productUnits: 1 });
    setProductModalVisible(true);
  };

  const handleEditProduct = (index) => {
    setEditingProduct(products[index]);
    setProductModalVisible(true);
  };

  const handleSaveProduct = () => {
    if (editingProduct.index !== undefined) {
      const updatedProducts = [...products];
      updatedProducts[editingProduct.index] = editingProduct;
      setProducts(updatedProducts);
    } else {
      setProducts([...products, editingProduct]);
    }
    setProductModalVisible(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (errors && errors.length > 0) {
      errors.forEach((error) => {
        console.log(error);
        handleError(error.data.errorCode, error.data.message); 
      });
    }
  }, [errors]);

  const handleError = (errorCode, errorMessage) => {
    
    switch (errorCode) {
      case "USER_NOT_FOUND":
        message.error("El usuario no existe. Por favor, verifica tu correo.");
        break;
      case "INVALID_CREDENTIALS":
        message.error("La contraseña es incorrecta. Intenta nuevamente.");
        break;
      case "SERVER_ERROR":
        message.error("Ocurrió un error en el servidor. Intenta más tarde.");
        break;
      default:
        message.error(errorMessage || "Error desconocido");
    }
  };

  return (
    <div>
      <h1>Crear Nueva Orden</h1>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Título de la Orden"
          name="orderTitle"
          rules={[
            {
              required: true,
              message: "Por favor ingresa un título para la orden",
            },
          ]}
        >
          <Input placeholder="Introduce el título de la orden" />
        </Form.Item>

        <Form.Item
          label="Asignar a cliente"
          name="userId"
          rules={[
            {
              required: true,
              message: "Por favor selecciona un cliente asignado",
            },
          ]}
        >
          <Select
            placeholder={
              dataloading
                ? "Cargando usuarios..."
                : "Selecciona un cliente asignado"
            }
            disabled={dataloading} 
            notFoundContent={dataloading ? <Spin size="small" /> : null} 
          >
            {users.map((user) => (
              <Option key={user.id} value={user.id}>
                {user.username}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Estado"
          name="state"
          rules={[
            { required: true, message: "Por favor selecciona un estado" },
          ]}
        >
          <Select placeholder="Selecciona un estado">
            <Option value="Pendiente">Pendiente</Option>
            <Option value="En camino">En Camino</Option>
            <Option value="Entregado">Entregado</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Punto Inicial"
          name="initialPoint"
          rules={[
            { required: true, message: "Por favor ingresa el punto inicial" },
          ]}
        >
          <Input placeholder="Introduce el punto inicial" />
        </Form.Item>

        <Form.Item
          label="Punto de Destino"
          name="destinyPoint"
          rules={[
            {
              required: true,
              message: "Por favor ingresa el punto de destino",
            },
          ]}
        >
          <Input placeholder="Introduce el punto de destino" />
        </Form.Item>

        <Form.Item label="Productos">
          <Button
            type="dashed"
            onClick={handleAddProduct}
            icon={<PlusOutlined />}
          >
            Añadir Productos
          </Button>
          {products.map((product, index) => (
            <div key={index} style={{ marginTop: 10 }}>
              <span>
                {product.productLabel} - Unidades: {product.productUnits}
              </span>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEditProduct(index)}
              />
              <Button
                type="link"
                danger
                onClick={() => handleDeleteProduct(index)}
              >
                Delete
              </Button>
            </div>
          ))}
        </Form.Item>

        <Form.Item
        label="Asignar a repartidor"
        name="asignedUserId"
        rules={[{ required: true, message: "Por favor selecciona un repartidor asignado" }]}
      >
        <Select 
          placeholder={dataloading ? "Cargando repartidores..." : "Selecciona un repartidor asignado"}
          disabled={dataloading} 
          notFoundContent={dataloading ? <Spin size="small" /> : null} 
        >
          {repartidores.map(repartidor => (
            <Option key={repartidor.id} value={repartidor.id}>
              {repartidor.username}
            </Option>
          ))}
        </Select>
      </Form.Item>
  

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Crear Orden
          </Button>
        </Form.Item>

        <Modal
          title="Añadir productos"
          open={productModalVisible}
          onOk={handleSaveProduct}
          onCancel={() => setProductModalVisible(false)}
        >
          <Form layout="vertical">
            <Form.Item label="Producto">
              <Input
                
                name="productLabel"
                value={editingProduct?.productLabel}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, productLabel: e.target.value })
                }
              />
            </Form.Item>
            <Form.Item label="Unidades">
              <Input
                name="productUnits"
                type="number"
                min={1}
                value={editingProduct?.productUnits}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    productUnits: e.target.value,
                  })
                }
              />
            </Form.Item>
          </Form>
        </Modal>
      </Form>
    </div>
  );
}
